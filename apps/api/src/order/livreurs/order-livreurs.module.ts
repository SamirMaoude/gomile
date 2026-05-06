import { Module } from '@nestjs/common';
import { OrderLivreursController } from './order-livreurs.controller';
import { OrderLivreursService } from './order-livreurs.service';
import { EmailVerifiedGuard } from '../../auth/guards/email-verified.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SmsModule } from '../../sms/sms.module';
import { WebhookModule } from '../../webhook/webhook.module';
import { Logger } from '@nestjs/common';
@Module({
  imports: [SmsModule, WebhookModule,],
  controllers: [OrderLivreursController],
  providers: [OrderLivreursService, Logger, RolesGuard, JwtAuthGuard, EmailVerifiedGuard],
  exports: [OrderLivreursService],
})
export class OrderLivreursModule {}
