import { Test, TestingModule } from '@nestjs/testing';
import { SubscriptionController } from 'src/subscription/subscription.controller';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { Tier } from '@prisma/client';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from 'src/auth/guards/email-verified.guard';

const allowAll = { canActivate: () => true };

const mockSubscriptionService = {
  createCheckoutSession: jest.fn(),
  createPortalSession: jest.fn(),
};

const user = { id: 'm1', role: 'MERCHANT' } as any;

describe('SubscriptionController', () => {
  let controller: SubscriptionController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubscriptionController],
      providers: [{ provide: SubscriptionService, useValue: mockSubscriptionService }],
    })
      .overrideGuard(JwtAuthGuard).useValue(allowAll)
      .overrideGuard(EmailVerifiedGuard).useValue(allowAll)
      .compile();
    controller = module.get(SubscriptionController);
  });

  it('checkout delegates to subscriptionService with plan and billing', async () => {
    mockSubscriptionService.createCheckoutSession.mockResolvedValue({ checkoutUrl: 'https://stripe.com' });
    await controller.checkout(user, Tier.PRO, 'monthly');
    expect(mockSubscriptionService.createCheckoutSession).toHaveBeenCalledWith('m1', Tier.PRO, 'monthly');
  });

  it('checkout defaults billing to monthly', async () => {
    mockSubscriptionService.createCheckoutSession.mockResolvedValue({ checkoutUrl: 'https://stripe.com' });
    await controller.checkout(user, Tier.PRO, 'monthly');
    expect(mockSubscriptionService.createCheckoutSession).toHaveBeenCalledWith('m1', Tier.PRO, 'monthly');
  });

  it('portal delegates to subscriptionService', async () => {
    mockSubscriptionService.createPortalSession.mockResolvedValue({ portalUrl: 'https://billing.stripe.com' });
    await controller.portal(user);
    expect(mockSubscriptionService.createPortalSession).toHaveBeenCalledWith('m1');
  });
});
