import {
  Controller,
  Post,
  Get,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { RegisterDriverDto } from './dto/register-driver.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthResponseDto, LogoutResponseDto } from './dto/auth-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser, AuthResponse } from './auth.types';

@ApiTags('[auth]')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Register a merchant account. An email will be send to verify this account' })
  @ApiBody({ type: RegisterMerchantDto })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiConflictResponse({ description: 'Email déjà utilisé' })
  @Post('register/merchant')
  registerMerchant(@Body() dto: RegisterMerchantDto): Promise<AuthResponse> {
    return this.authService.registerMerchant(dto);
  }

  @ApiOperation({ summary: 'Register a driver account. An email will be send to verify this account' })
  @ApiBody({ type: RegisterDriverDto })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiConflictResponse({ description: 'Email déjà utilisé' })
  @Post('register/driver')
  registerDriver(@Body() dto: RegisterDriverDto): Promise<AuthResponse> {
    return this.authService.registerDriver(dto);
  }

  @ApiOperation({ summary: 'Log in with email and password', description: 'Returns access and refresh tokens. On the web platform, tokens are stored as httpOnly cookies by the BFF, the response body only contains the user object. Mobile clients receive tokens directly in the response body.' })
  @ApiBody({ type: LoginDto })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Identifiants invalides' })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Refresh access and refresh tokens', description: 'On the web platform, the refresh token is read from an httpOnly cookie by the BFF — no Authorization header needed from the browser. Mobile clients must send the refresh token as a Bearer token.' })
  @ApiBearerAuth('refresh-token')
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: 'Refresh token invalide' })
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@CurrentUser() user: AuthenticatedUser): Promise<AuthResponse> {
    return this.authService.refresh(user.id, user.email, user.role);
  }

  @ApiOperation({ summary: 'Verify email address via token from email link', description: 'After registrating a user, an email containing an url with a token will be send to this user. Frontend must implement a page at /verify-email that reads the token query param, calls this endpoint and shows a confirmation message to the user' })
  @ApiOkResponse({ description: 'Email verified successfully' })
  @ApiBadRequestResponse({ description: 'Invalid or expired token' })
  @Get('verify-email')
  @HttpCode(HttpStatus.OK)
  verifyEmail(@Query() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @ApiOperation({ summary: 'Request a password reset code' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({ description: 'Reset code sent if email is registered' })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @ApiOperation({ summary: 'Verify OTP and get a short-lived reset token' })
  @ApiBody({ type: VerifyOtpDto })
  @ApiOkResponse({ description: 'OTP valid, reset token returned' })
  @ApiBadRequestResponse({ description: 'Invalid or expired OTP' })
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyOtp(dto);
  }

  @ApiOperation({ summary: 'Reset password using reset token from verify-otp' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ description: 'Password reset successfully' })
  @ApiBadRequestResponse({ description: 'Invalid or expired reset token' })
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @ApiOperation({ summary: 'Log out the current user', description: 'On the web platform, the access token is read from an httpOnly cookie by the BFF and both cookies are cleared on response. Mobile clients must send the access token as a Bearer token.' })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: LogoutResponseDto })
  @ApiUnauthorizedResponse({ description: 'Access token invalide' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@CurrentUser() user: AuthenticatedUser) {
    return this.authService.logout(user.id);
  }
}
