import { Module } from '@nestjs/common';
import { EmailsModule } from '../emails/emails.module';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';

@Module({
  imports: [EmailsModule],
  providers: [SubscriptionService, EmailVerifiedGuard],
  controllers: [SubscriptionController],
  exports: [SubscriptionService],
})
export class SubscriptionModule {}
