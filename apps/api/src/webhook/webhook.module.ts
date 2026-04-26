import { Logger, Module } from '@nestjs/common';
import { WebhookController } from './webhook.controller';
import { SubscriptionService } from '../subscription/subscription.service';
import { EmailService } from 'src/emails/email.service';

@Module({ 
  providers: [SubscriptionService, EmailService, Logger],
  controllers: [WebhookController],
})
export class WebhookModule {}
