import { Module } from '@nestjs/common';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { DeliveryPricingModule } from '../delivery/delivery-pricing.module';

@Module({
  imports: [DeliveryPricingModule],
  controllers: [StoreController],
  providers: [StoreService, RolesGuard, EmailVerifiedGuard],
})
export class StoreModule {}
