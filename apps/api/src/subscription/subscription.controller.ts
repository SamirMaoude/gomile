import {
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  ParseEnumPipe,
  Post,
  Query,
  RawBody,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Tier } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { SubscriptionService } from './subscription.service';

@ApiTags('[Subscription]')
@Controller('subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Post('checkout')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Start a plan upgrade checkout',
    description: 'Creates a Stripe Checkout session for the given plan. Returns a one-time URL, redirect the merchant to it. On success, Stripe redirects back to merchant/dashboard and fires a webhook that activates the plan automatically. If cancelled midway, redirects to merchant/subscription',
  })
  @ApiQuery({ name: 'plan', enum: ['PRO', 'BUSINESS'] })
  @ApiOkResponse({ schema: { properties: { checkoutUrl: { type: 'string' } } } })
  checkout(
    @CurrentUser() user: AuthenticatedUser,
    @Query('plan') plan: Tier,
  ): Promise<{ checkoutUrl: string }> {
    return this.subscriptionService.createCheckoutSession(user.id, plan);
  }

  @Post('portal')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard, EmailVerifiedGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Open the billing management portal',
    description: 'Creates a Stripe Customer Portal session. Returns a URL and redirect the merchant to it. From there they can update their payment card, download invoices, or cancel their subscription. Stripe redirects back to merchant/dashboard when done.',
  })
  @ApiOkResponse({ schema: { properties: { portalUrl: { type: 'string' } } } })
  portal(@CurrentUser() user: AuthenticatedUser): Promise<{ portalUrl: string }> {
    return this.subscriptionService.createPortalSession(user.id);
  }

}
