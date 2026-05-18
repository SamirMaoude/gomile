import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/emails/email.service';
import { Tier, SubscriptionStatus } from '@prisma/client';

// Mock Stripe before any import resolves it
const mockStripe = {
  customers: { create: jest.fn() },
  checkout: { sessions: { create: jest.fn() } },
  billingPortal: { sessions: { create: jest.fn() } },
  webhooks: { constructEvent: jest.fn() },
  subscriptions: { retrieve: jest.fn() },
};

jest.mock('stripe', () => jest.fn().mockImplementation(() => mockStripe));

const mockPrisma = {
  merchant: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    update: jest.fn(),
  },
  store: {
    findMany: jest.fn(),
    updateMany: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation((ops) =>
    Array.isArray(ops) ? Promise.all(ops) : ops(mockPrisma),
  ),
};

const mockEmail = {
  sendAccountLocked: jest.fn(),
  sendPaymentFailed: jest.fn(),
};

describe('SubscriptionService', () => {
  let service: SubscriptionService;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = 'sk_test_fake';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_fake';
    process.env.STRIPE_PRO_PRICE_ID = 'price_pro';
    process.env.STRIPE_BUSINESS_PRICE_ID = 'price_business';
    process.env.APP_URL = 'https://app.gomile.fr';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubscriptionService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: mockEmail },
      ],
    }).compile();

    service = module.get(SubscriptionService);
  });

  describe('createCheckoutSession', () => {
    beforeEach(() => {
      mockPrisma.merchant.findUnique.mockResolvedValue({
        userId: 'merchant1',
        stripeCustomerId: 'cus_existing',
        user: { email: 'merchant@test.com' },
        name: 'Shop',
      });
      mockStripe.checkout.sessions.create.mockResolvedValue({ url: 'https://checkout.stripe.com/session' });
    });

    it('returns checkoutUrl when merchant already has stripe customer', async () => {
      const result = await service.createCheckoutSession('merchant1', Tier.PRO, 'monthly');
      expect(result.checkoutUrl).toBe('https://checkout.stripe.com/session');
    });

    it('creates stripe customer when merchant has no stripeCustomerId', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue({
        userId: 'merchant1',
        stripeCustomerId: null,
        user: { email: 'merchant@test.com' },
        name: 'Shop',
      });
      mockStripe.customers.create.mockResolvedValue({ id: 'cus_new' });
      mockPrisma.merchant.update.mockResolvedValue({});

      const result = await service.createCheckoutSession('merchant1', Tier.PRO, 'monthly');
      expect(mockStripe.customers.create).toHaveBeenCalled();
      expect(result.checkoutUrl).toBeDefined();
    });

    it('throws ForbiddenException when merchant not found', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue(null);
      await expect(service.createCheckoutSession('bad-id', Tier.PRO, 'monthly')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createPortalSession', () => {
    it('returns portalUrl when merchant has stripe customer', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue({ stripeCustomerId: 'cus_123' });
      mockStripe.billingPortal.sessions.create.mockResolvedValue({ url: 'https://billing.stripe.com/portal' });

      const result = await service.createPortalSession('merchant1');
      expect(result.portalUrl).toBe('https://billing.stripe.com/portal');
    });

    it('throws BadRequestException when no stripe customer exists', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue({ stripeCustomerId: null });
      await expect(service.createPortalSession('merchant1')).rejects.toThrow(BadRequestException);
    });
  });

  describe('handleWebhook', () => {
    it('throws BadRequestException when signature is invalid', async () => {
      mockStripe.webhooks.constructEvent.mockImplementation(() => { throw new Error('sig'); });
      await expect(service.handleWebhook(Buffer.from('{}'), 'bad-sig')).rejects.toThrow(BadRequestException);
    });

    it('handles checkout.session.completed and updates merchant', async () => {
      const session = {
        client_reference_id: 'merchant1',
        customer: 'cus_123',
        subscription: 'sub_123',
      };
      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'checkout.session.completed',
        data: { object: session },
      });
      mockStripe.subscriptions.retrieve.mockResolvedValue({
        items: { data: [{ price: { id: 'price_pro' }, current_period_end: 1800000000 }] },
      });
      mockPrisma.merchant.update.mockResolvedValue({});
      mockPrisma.store.findMany.mockResolvedValue([]);
      mockPrisma.$transaction.mockResolvedValue([]);

      await expect(service.handleWebhook(Buffer.from('{}'), 'sig')).resolves.toBeUndefined();
      expect(mockPrisma.merchant.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ subscriptionStatus: SubscriptionStatus.ACTIVE }) }),
      );
    });

    it('handles customer.subscription.deleted and locks all stores', async () => {
      const sub = { id: 'sub_123' };
      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'customer.subscription.deleted',
        data: { object: sub },
      });
      mockPrisma.merchant.findFirst.mockResolvedValue({
        userId: 'merchant1',
        name: 'Shop',
        user: { email: 'merchant@test.com' },
      });
      mockPrisma.store.updateMany.mockResolvedValue({});
      mockPrisma.merchant.update.mockResolvedValue({});
      mockEmail.sendAccountLocked.mockResolvedValue(undefined);

      await service.handleWebhook(Buffer.from('{}'), 'sig');
      expect(mockPrisma.store.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isLocked: true } }),
      );
    });

    it('handles invoice.payment_failed and sets PAST_DUE', async () => {
      mockStripe.webhooks.constructEvent.mockReturnValue({
        type: 'invoice.payment_failed',
        data: { object: { customer: 'cus_123' } },
      });
      mockPrisma.merchant.findFirst.mockResolvedValue({
        userId: 'merchant1',
        name: 'Shop',
        user: { email: 'merchant@test.com' },
      });
      mockPrisma.merchant.update.mockResolvedValue({});
      mockEmail.sendPaymentFailed = jest.fn().mockResolvedValue(undefined);

      await service.handleWebhook(Buffer.from('{}'), 'sig');
      expect(mockPrisma.merchant.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { subscriptionStatus: SubscriptionStatus.PAST_DUE } }),
      );
    });
  });

  describe('syncStoreLocks', () => {
    it('locks all stores then unlocks stores within quota', async () => {
      mockPrisma.store.findMany.mockResolvedValue([{ id: 'store1' }, { id: 'store2' }]);
      mockPrisma.$transaction.mockResolvedValue([]);

      await service.syncStoreLocks('merchant1', Tier.PRO);

      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('unlocks all stores for BUSINESS tier (unlimited)', async () => {
      mockPrisma.store.findMany.mockResolvedValue([{ id: 's1' }, { id: 's2' }, { id: 's3' }]);
      mockPrisma.$transaction.mockResolvedValue([]);

      await service.syncStoreLocks('merchant1', Tier.BUSINESS);
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });
  });
});
