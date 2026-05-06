import { Module } from '@nestjs/common';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { MerchantService } from './merchant.service';
import { MerchantController } from './merchant.controller';

@Module({
  providers: [MerchantService, EmailVerifiedGuard],
  controllers: [MerchantController],
})
export class MerchantModule {}
