import { Module } from '@nestjs/common';
import { DriverMeController } from './driver-me.controller';
import { DriverMeService } from './driver-me.service';
import { OrderLivreursModule } from '../order/livreurs/order-livreurs.module';
import { UploadModule } from '../upload/upload.module';
import { KycModule } from '../kyc/kyc.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtService } from '@nestjs/jwt';
import { EventsGateway } from 'src/events/events.gateway';

@Module({
  imports: [OrderLivreursModule, UploadModule, KycModule],
  controllers: [DriverMeController],
  providers: [DriverMeService, JwtAuthGuard, RolesGuard, EmailVerifiedGuard, JwtService, EventsGateway],
})
export class DriverMeModule {}
