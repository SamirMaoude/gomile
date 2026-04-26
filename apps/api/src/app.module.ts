import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { KycModule } from './kyc/kyc.module';
import { DeliveryPricingModule } from './delivery/delivery-pricing.module';
import { RedisModule } from './redis/redis.module';
import { StoreModule } from './store/store.module';
import { OrderMerchantsModule } from './order/merchants/order-merchants.module';
import { OrderLivreursModule } from './order/livreurs/order-livreurs.module';
import { DriverMeModule } from './driver/driver-me.module';
import { UploadModule } from './upload/upload.module';
import { AdminModule } from './admin/admin.module';
import { MerchantModule } from './merchant/merchant.module';
import { TasksModule } from './tasks/tasks.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { WebhookModule } from './webhook/webhook.module';
import { NotificationModule } from './notification/notification.module';
import { SmsModule } from './sms/sms.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10 }]),
    PrismaModule,
    AuthModule,
    KycModule,
    DeliveryPricingModule,
    RedisModule,
    StoreModule,
    OrderLivreursModule,
    OrderMerchantsModule,
    DriverMeModule,
    UploadModule,
    AdminModule,
    MerchantModule,
    TasksModule,
    SubscriptionModule,
    WebhookModule,
    NotificationModule,
    SmsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
