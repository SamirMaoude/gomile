import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OrderStatus, SubscriptionStatus } from '@prisma/client';
import { EmailService } from '../emails/email.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  // A cron that deletes unverified account at 2am for all non verified accounts more than 48h
  // Why 2am ? Because I sleep at 2am...
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async deleteUnverifiedAccount() {
    // 2 days ago
    const limitDate = new Date(Date.now() - 48 * 60 * 60 * 1000);

    const { count } = await this.prisma.user.deleteMany({
      where: {
        emailVerified: false,
        createdAt: {
          lt: limitDate,
        },
      },
    });
    this.logger.log(`Deleted ${count} unverified accounts`);
  }


  // Lock trials, so they have to pay
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async lockExpiredTrials() {
    const merchants = await this.prisma.merchant.findMany({
      where: {
        subscriptionStatus: SubscriptionStatus.TRIAL,
        trialEndsAt: { lt: new Date() },
      },
      include: { user: true },
    });

    for (const merchant of merchants) {
      await this.prisma.store.updateMany({
        where: { merchantId: merchant.userId },
        data: { isLocked: true },
      });
      await this.prisma.merchant.update({
        where: { userId: merchant.userId },
        data: { subscriptionStatus: SubscriptionStatus.LOCKED },
      });
      await this.emailService.sendAccountLocked(
        merchant.user.email,
        merchant.name,
        `${process.env.APP_URL}/upgrade`,
      );
    }
    this.logger.log(`Locked ${merchants.length} expired trial accounts`);
  }

  // Trial users should be warned before their subscriptions expired (10 days prior)
  // Now, these warning emails should be send in the morning so ppl actually read them 
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async warnExpiringTrials() {
    const now = new Date();
    const in9days = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000);
    const in10days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

    const merchants = await this.prisma.merchant.findMany({
      where: {
        subscriptionStatus: SubscriptionStatus.TRIAL,
        trialEndsAt: { gte: in9days, lte: in10days },
      },
      include: { user: true },
    });

    for (const merchant of merchants) {
      await this.emailService.sendTrialExpiring(
        merchant.user.email,
        merchant.name,
        merchant.trialEndsAt!,
        `${process.env.APP_URL}/upgrade`,
      );
    }
    this.logger.log(`Trial expiry warnings sent to ${merchants.length} merchants`);
  }

    // Warning emails for subscribed user
  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async warnExpiringSubscriptions() {
    const now = new Date();
    const in9days = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000);
    const in10days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000);

    const merchants = await this.prisma.merchant.findMany({
      where: {
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        currentPeriodEnd: { gte: in9days, lte: in10days },
      },
      include: { user: true },
    });

    for (const merchant of merchants) {
      await this.emailService.sendSubscriptionRenewing(
        merchant.user.email,
        merchant.name,
        merchant.subscription,
        merchant.currentPeriodEnd!,
        `${process.env.APP_URL}/subscription/portal`,
      );
    }
    this.logger.log(`Renewal warnings sent to ${merchants.length} merchants`);
  }

  // API keys with expiresAt in the past but revokedAt still null show up as active in listings.
  // This nightly job stamps revokedAt on them so the state is consistent.
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async revokeExpiredApiKeys() {
    const { count } = await this.prisma.merchantApiKey.updateMany({
      where: {
        revokedAt: null,
        expiresAt: { lt: new Date() },
      },
      data: { revokedAt: new Date() },
    });
    this.logger.log(`Revoked ${count} expired API keys`);
  }

  // Stripe fires customer.subscription.deleted when a PAST_DUE subscription is finally killed,
  // but if that webhook is missed the merchant stays PAST_DUE with stores still active.
  // We lock any merchant stuck in PAST_DUE for more than 14 days.
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async lockOverduePastDueSubscriptions() {
    const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const merchants = await this.prisma.merchant.findMany({
      where: {
        subscriptionStatus: SubscriptionStatus.PAST_DUE,
        currentPeriodEnd: { lt: cutoff },
      },
      include: { user: true },
    });

    for (const merchant of merchants) {
      await this.prisma.store.updateMany({
        where: { merchantId: merchant.userId },
        data: { isLocked: true },
      });
      await this.prisma.merchant.update({
        where: { userId: merchant.userId },
        data: { subscriptionStatus: SubscriptionStatus.LOCKED },
      });
      await this.emailService.sendAccountLocked(
        merchant.user.email,
        merchant.name,
        `${process.env.APP_URL}/upgrade`,
      );
    }
    this.logger.log(`Locked ${merchants.length} overdue PAST_DUE merchants`);
  }

  // Rejections are only useful while the order is SEARCHING_DRIVER.
  // Once the order moves to any other status, the rejection rows are dead weight.
  @Cron(CronExpression.EVERY_WEEKEND) // every Sunday at 3am
  async purgeOldOrderRejections() {
    const { count } = await this.prisma.driverOrderRejection.deleteMany({
      where: {
        order: {
          status: {
            in: [
              OrderStatus.DRIVER_ACCEPTED,
              OrderStatus.PICKED_UP,
              OrderStatus.DELIVERED,
              OrderStatus.CANCELLED,
            ],
          },
        },
      },
    });
    this.logger.log(`Purged ${count} old order rejections`);
  }

  // Handshake rows for closed orders are dead weight — they are never queried again
  // once an order is delivered or cancelled. Weekly purge keeps the table clean.
  @Cron(CronExpression.EVERY_WEEKEND) // every Sunday at 3am
  async purgeClosedOrderHandshakes() {
    const { count } = await this.prisma.handshake.deleteMany({
      where: {
        order: {
          status: { in: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] },
        },
      },
    });
    this.logger.log(`Purged ${count} handshakes from closed orders`);
  }

}
