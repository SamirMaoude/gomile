import { Module } from '@nestjs/common';
import { OrderService } from './order-merchants.service';
import { OrderMerchantsController } from './order-merchants.controller';
import { OrderPluginController } from '../plugin/order-plugin.controller';
import { ApiKeyService } from '../../auth/api-key.service';
import { EmailVerifiedGuard } from '../../auth/guards/email-verified.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtOrApiKeyGuard } from '../../auth/guards/jwt-or-api-key.guard';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { DeliveryPricingModule } from '../../delivery/delivery-pricing.module';
import { NotificationModule } from '../../notification/notification.module';
import { WebhookModule } from '../../webhook/webhook.module';
import { SmsModule } from '../../sms/sms.module';
import { EventsGateway } from '../../events/events.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [DeliveryPricingModule, NotificationModule, WebhookModule, SmsModule],
  controllers: [OrderMerchantsController, OrderPluginController],
  providers: [
    OrderService,
    RolesGuard,
    ApiKeyService,
    JwtOrApiKeyGuard,
    ApiKeyGuard,
    JwtAuthGuard,
    EmailVerifiedGuard,
    EventsGateway,
    JwtService
  ],
})
export class OrderMerchantsModule {}
