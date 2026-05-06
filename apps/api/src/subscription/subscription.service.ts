import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import Stripe from 'stripe'
import { Tier, SubscriptionStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../emails/email.service';
import { TIER_LIMITS } from './subscription.config';
import { createApiError } from '../common/api-error';
import { SUBSCRIPTION_ERRORS } from './subscription.errors';
import { AUTH_ERRORS } from '../auth/auth-errors';

@Injectable()
export class SubscriptionService {
  private readonly stripe: InstanceType<typeof Stripe>;
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }
    this.stripe = new Stripe(key);
  }

  // Create a checkout session url, merchants will be taken to Stripe site where payment will be held
  async createCheckoutSession(userId: string, plan: Tier): Promise<{ checkoutUrl: string }> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!merchant) {
      throw new ForbiddenException(createApiError('MERCHANT_NOT_FOUND', AUTH_ERRORS));
    }

    let customerId = merchant.stripeCustomerId;
    if (!customerId) {
      const customer = await this.stripe.customers.create({
        email: merchant.user.email,
        name: merchant.name,
        metadata: { userId },
      });
      customerId = customer.id;
      await this.prisma.merchant.update({
        where: { userId },
        data: { stripeCustomerId: customerId },
      });
    }

    // session returns to subscription pricing page if failed
    const session = await this.stripe.checkout.sessions.create({
      customer: customerId,
      client_reference_id: userId,
      mode: 'subscription',
      line_items: [{ price: this.getPriceId(plan), quantity: 1 }],
      success_url: `${process.env.APP_URL}/merchant/dashboard`,
      cancel_url: `${process.env.APP_URL}/subscription`,
    });

    return { checkoutUrl: session.url! };
  }

  // Returns an url to Stripe portal where user will handle cards, billing and upgrade/cancellations
  async createPortalSession(userId: string): Promise<{ portalUrl: string }> {
    const merchant = await this.prisma.merchant.findUnique({
      where: { userId },
    });

    if (!merchant?.stripeCustomerId) {
      throw new BadRequestException(createApiError('NO_STRIPE_SUBSCRIPTION', SUBSCRIPTION_ERRORS));
    }

    const session = await this.stripe.billingPortal.sessions.create({
      customer: merchant.stripeCustomerId,
      return_url: `${process.env.APP_URL}/merchant/dashboard`,
    });

    return { portalUrl: session.url };
  }

  // Handle webhook events calling from Stripe
  async handleWebhook(payload: Buffer, signature: string): Promise<void> {
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_WEBHOOK_SECRET is not defined');
    }
    
    let event : any;
    try {
      event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    switch (event.type) {
      case 'checkout.session.completed':
        await this.onCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.onSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.onSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.onPaymentFailed(event.data.object);
        break;
    }
  }

  async syncStoreLocks(userId: string, tier: Tier): Promise<void> {
    const limit = TIER_LIMITS[tier];
    const stores = await this.prisma.store.findMany({
      where: { merchantId: userId },
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });

    // array of all to be active stores
    const activeIds = limit === Infinity
      ? stores.map((s) => s.id)
      : stores.slice(0, limit).map((s) => s.id);

    // adjust and lock all stores that excess the quota
    await this.prisma.$transaction([
      this.prisma.store.updateMany({
        where: { merchantId: userId },
        data: { isLocked: true },
      }),
      this.prisma.store.updateMany({
        where: { id: { in: activeIds } },
        data: { isLocked: false },
      }),
    ]);
  }

  // update backend data on subscription and unlock stores
  private async onCheckoutCompleted(session: any) {
    const merchantId = session.client_reference_id!;
    const stripeCustomerId = session.customer as string;
    const stripeSubscriptionId = session.subscription as string;

    const subscription = await this.stripe.subscriptions.retrieve(stripeSubscriptionId);
    const tier = this.getTierFromPriceId(subscription.items.data[0].price.id) ?? Tier.PRO;

    await this.prisma.merchant.update({
      where: { userId: merchantId },
      data: {
        subscription: tier,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
        stripeCustomerId,
        stripeSubscriptionId,
        currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
      },
    });
    await this.syncStoreLocks(merchantId, tier);
  }

  // If subscription tier change, update/limit stores. If pastdue, Stripe will retry but if after a week, delete event will be called
  private async onSubscriptionUpdated(subscription: any) {
    const merchant = await this.prisma.merchant.findFirst({
      where: { stripeSubscriptionId: subscription.id },
    });
    if (!merchant) return;

    const newTier =
      this.getTierFromPriceId(subscription.items.data[0].price.id) ??
      merchant.subscription;

    const newStatus =
      subscription.status === 'active'
        ? SubscriptionStatus.ACTIVE
        : subscription.status === 'past_due'
          ? SubscriptionStatus.PAST_DUE
          : merchant.subscriptionStatus;

    await this.prisma.merchant.update({
      where: { userId: merchant.userId },
      data: {
        subscription: newTier,
        subscriptionStatus: newStatus,
        currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
      },
    });

    if (newTier !== merchant.subscription) {
      await this.syncStoreLocks(merchant.userId, newTier);
    }
  }

  // Lock all stores
  private async onSubscriptionDeleted(subscription: any) {
    const merchant = await this.prisma.merchant.findFirst({
      where: { stripeSubscriptionId: subscription.id },
      include: { user: true },
    });
    if (!merchant) return;

    await this.prisma.store.updateMany({
      where: { merchantId: merchant.userId },
      data: { isLocked: true },
    });
    await this.prisma.merchant.update({
      where: { userId: merchant.userId },
      data: {
        subscription: Tier.FREE,
        subscriptionStatus: SubscriptionStatus.LOCKED,
        stripeSubscriptionId: null,
        currentPeriodEnd: null,
      },
    });
    await this.emailService.sendAccountLocked(
      merchant.user.email,
      merchant.name,
      `${process.env.APP_URL}/upgrade`,
    );
  }

  // On failed payment
  private async onPaymentFailed(invoice: any) {
    const customerId = typeof invoice.customer === 'string'
      ? invoice.customer
      : invoice.customer?.id;
    if (!customerId) return;

    const merchant = await this.prisma.merchant.findFirst({
      where: { stripeCustomerId: customerId },
      include: { user: true },
    });
    if (!merchant) return;

    await this.prisma.merchant.update({
      where: { userId: merchant.userId },
      data: { subscriptionStatus: SubscriptionStatus.PAST_DUE },
    });
    await this.emailService.sendPaymentFailed(
      merchant.user.email,
      merchant.name,
      `${process.env.APP_URL}/subscription`,
    );
  }

  // Price ID from tier
  private getPriceId(plan: Tier): string {
    const id =
      plan === Tier.PRO
        ? process.env.STRIPE_PRO_PRICE_ID
        : process.env.STRIPE_BUSINESS_PRICE_ID;
    if (!id) throw new Error(`Missing Stripe price ID for plan: ${plan}`);
    return id;
  }

  // Parse tier object from stripe priceId 
  private getTierFromPriceId(priceId: string): Tier | null {
    if (priceId === process.env.STRIPE_PRO_PRICE_ID) return Tier.PRO;
    if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) return Tier.BUSINESS;
    return null;
  }
}
