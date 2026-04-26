import { Module } from '@nestjs/common';
import { OrderLivreursController } from './order-livreurs.controller';
import { OrderLivreursService } from './order-livreurs.service';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SmsModule } from '../../sms/sms.module';

@Module({
  imports: [SmsModule],
  controllers: [OrderLivreursController],
  providers: [OrderLivreursService, RolesGuard, JwtAuthGuard],
  exports: [OrderLivreursService],
})
export class OrderLivreursModule {}
