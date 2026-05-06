import { Logger, Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { SubscriptionService } from '../subscription/subscription.service';
import { EmailService } from '../emails/email.service';
import { OutboundWebhookService } from './outbound-webhook.service';

@Module({
  providers: [SubscriptionService, EmailService, Logger, OutboundWebhookService],
  controllers: [WebhookController],
  exports: [OutboundWebhookService],
})
export class WebhookModule {}
