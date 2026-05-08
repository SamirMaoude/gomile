import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { TasksService } from 'src/tasks/tasks.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailService } from 'src/emails/email.service';
import { SubscriptionStatus } from '@prisma/client';

jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

const mockPrisma = {
  user: { deleteMany: jest.fn() },
  merchant: { findMany: jest.fn(), update: jest.fn() },
  store: { updateMany: jest.fn() },
};

const mockEmail = {
  sendAccountLocked: jest.fn(),
  sendTrialExpiring: jest.fn(),
  sendSubscriptionRenewing: jest.fn(),
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: EmailService, useValue: mockEmail },
      ],
    }).compile();

    service = module.get(TasksService);
  });

  describe('deleteUnverifiedAccount', () => {
    it('deletes unverified accounts older than 48h', async () => {
      mockPrisma.user.deleteMany.mockResolvedValue({ count: 3 });
      await service.deleteUnverifiedAccount();
      expect(mockPrisma.user.deleteMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ emailVerified: false }),
        }),
      );
    });

    it('logs the number of deleted accounts', async () => {
      mockPrisma.user.deleteMany.mockResolvedValue({ count: 2 });
      await service.deleteUnverifiedAccount();
      expect(Logger.prototype.log).toHaveBeenCalledWith(expect.stringContaining('2'));
    });
  });

  describe('lockExpiredTrials', () => {
    const expiredMerchant = {
      userId: 'merchant1',
      name: 'Shop',
      user: { email: 'merchant@test.com' },
    };

    it('locks stores and updates merchant status for expired trials', async () => {
      mockPrisma.merchant.findMany.mockResolvedValue([expiredMerchant]);
      mockPrisma.store.updateMany.mockResolvedValue({});
      mockPrisma.merchant.update.mockResolvedValue({});
      mockEmail.sendAccountLocked.mockResolvedValue(undefined);

      await service.lockExpiredTrials();

      expect(mockPrisma.store.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({ data: { isLocked: true } }),
      );
      expect(mockPrisma.merchant.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { subscriptionStatus: SubscriptionStatus.LOCKED } }),
      );
      expect(mockEmail.sendAccountLocked).toHaveBeenCalledWith(
        'merchant@test.com',
        'Shop',
        expect.any(String),
      );
    });

    it('does nothing when no expired trials found', async () => {
      mockPrisma.merchant.findMany.mockResolvedValue([]);
      await service.lockExpiredTrials();
      expect(mockPrisma.store.updateMany).not.toHaveBeenCalled();
    });
  });

  describe('warnExpiringTrials', () => {
    it('sends warning email to merchants expiring in ~10 days', async () => {
      const merchant = {
        userId: 'merchant1',
        name: 'Shop',
        trialEndsAt: new Date(Date.now() + 9.5 * 24 * 60 * 60 * 1000),
        user: { email: 'merchant@test.com' },
      };
      mockPrisma.merchant.findMany.mockResolvedValue([merchant]);
      mockEmail.sendTrialExpiring.mockResolvedValue(undefined);

      await service.warnExpiringTrials();

      expect(mockEmail.sendTrialExpiring).toHaveBeenCalledWith(
        'merchant@test.com',
        'Shop',
        expect.any(Date),
        expect.any(String),
      );
    });

    it('does nothing when no merchants are expiring soon', async () => {
      mockPrisma.merchant.findMany.mockResolvedValue([]);
      await service.warnExpiringTrials();
      expect(mockEmail.sendTrialExpiring).not.toHaveBeenCalled();
    });
  });

  describe('warnExpiringSubscriptions', () => {
    it('sends renewal warning to active subscriptions expiring in ~10 days', async () => {
      const merchant = {
        userId: 'merchant1',
        name: 'Shop',
        subscription: 'PRO',
        currentPeriodEnd: new Date(Date.now() + 9.5 * 24 * 60 * 60 * 1000),
        user: { email: 'merchant@test.com' },
      };
      mockPrisma.merchant.findMany.mockResolvedValue([merchant]);
      mockEmail.sendSubscriptionRenewing.mockResolvedValue(undefined);

      await service.warnExpiringSubscriptions();

      expect(mockEmail.sendSubscriptionRenewing).toHaveBeenCalledWith(
        'merchant@test.com',
        'Shop',
        'PRO',
        expect.any(Date),
        expect.any(String),
      );
    });

    it('does nothing when no subscriptions expiring soon', async () => {
      mockPrisma.merchant.findMany.mockResolvedValue([]);
      await service.warnExpiringSubscriptions();
      expect(mockEmail.sendSubscriptionRenewing).not.toHaveBeenCalled();
    });
  });
});
