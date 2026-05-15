import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { KycModule } from '../kyc/kyc.module';
import { AuthModule } from '../auth/auth.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [KycModule, AuthModule, UploadModule],
  controllers: [AdminController],
  providers: [AdminService, RolesGuard, JwtAuthGuard],
})
export class AdminModule {}
