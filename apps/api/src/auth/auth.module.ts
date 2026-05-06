import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EmailsModule } from '../emails/emails.module';
import { UploadModule } from '../upload/upload.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { RolesGuard } from './guards/roles.guard';
import { ApiKeyGuard } from './guards/api-key.guard';
import { ApiKeyService } from './api-key.service';
import { ApiKeyController } from './api-key.controller';
import { JwtOrApiKeyGuard } from './guards/jwt-or-api-key.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { EmailVerifiedGuard } from './guards/email-verified.guard';

@Module({
  imports: [JwtModule.register({}), EmailsModule, UploadModule],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    RolesGuard,
    ApiKeyGuard,
    ApiKeyService,
    JwtOrApiKeyGuard,
    JwtAuthGuard,
    EmailVerifiedGuard,
  ], // adding guard provider for nest
  controllers: [AuthController, ApiKeyController],
  exports: [
    AuthService,
    ApiKeyGuard,
    ApiKeyService,
    JwtOrApiKeyGuard,
    EmailVerifiedGuard,
    JwtAuthGuard,
    RolesGuard,
  ],
})
export class AuthModule {}
