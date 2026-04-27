import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EmailsModule } from '../emails/emails.module';
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

@Module({
  imports: [JwtModule.register({}), EmailsModule],
  providers: [
    AuthService,
    JwtStrategy,
    JwtRefreshStrategy,
    RolesGuard,
    ApiKeyGuard,
    ApiKeyService,
    JwtOrApiKeyGuard,
    JwtAuthGuard,
  ], // adding guard provider for nest
  controllers: [AuthController, ApiKeyController],
  exports: [AuthService, ApiKeyGuard, ApiKeyService, JwtOrApiKeyGuard],
})
export class AuthModule {}
