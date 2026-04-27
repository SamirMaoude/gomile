import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentType, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID, randomBytes, createHash, randomInt } from 'crypto';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { RegisterDriverDto } from './dto/register-driver.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { AuthResponse } from './auth.types';
import { createApiError } from '../common/api-error';
import { AUTH_MESSAGES } from './auth-messages';
import { AUTH_ERRORS } from './auth-errors';
import { EmailService } from '../emails/email.service';

const DEFAULT_APP_URL = 'http://localhost:3001';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}
  // Return a hash of the pwd
  private hashPassword(pwd: string) {
    return bcrypt.hash(pwd, 10);
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  // Generate a verification token that expires in 48h
  private generateVerificationToken() {
    const token = randomBytes(32).toString('hex');
    const hash = this.hashToken(token);
    const expiry = new Date(Date.now() + 48 * 60 * 60 * 1000);
    return { token, hash, expiry };
  }

  // Merchant created will have a trial period of 30 days
  async registerMerchant(dto: RegisterMerchantDto): Promise<AuthResponse> {
    await this.checkEmailAvailable(dto.email);
    const hashedPassword = await this.hashPassword(dto.password);

    if (dto.phone) await this.checkPhoneAvailable(dto.phone);

    const { token, hash, expiry } = this.generateVerificationToken();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        phone: dto.phone ?? null,
        password: hashedPassword,
        role: Role.MERCHANT,
        emailVerificationToken: hash,
        emailVerificationExpiry: expiry,
        merchant: {
          create: {
            name: dto.name,
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    // Sending a verifying url to registrants
    const verifyUrl = `${process.env.APP_URL ?? DEFAULT_APP_URL}/verify-email?token=${token}`;
    await this.emailService.sendVerificationEmail(
      user.email,
      dto.name,
      verifyUrl,
    );

    return this.generateAndSaveTokens(user.id, user.email, user.role);
  }

  async registerDriver(dto: RegisterDriverDto): Promise<AuthResponse> {
    await this.checkEmailAvailable(dto.email);
    await this.checkPhoneAvailable(dto.phone);
    const hashedPassword = await this.hashPassword(dto.password);
    const gomileCode = await this.generateUniqueGomileCode();
    const { token, hash, expiry } = this.generateVerificationToken();

    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        phone: dto.phone,
        password: hashedPassword,
        role: Role.DRIVER,
        emailVerificationToken: hash,
        emailVerificationExpiry: expiry,
        driver: {
          create: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            dateOfBirth: new Date(dto.dateOfBirth),
            gender: dto.gender,
            avatarUrl: dto.avatarUrl,
            address: dto.address,
            city: dto.city,
            zipCode: dto.zipCode,
            street: dto.street,
            deliveryCity: dto.deliveryCity,
            deliveryRadius: dto.deliveryRadius,
            transportType: dto.transportType,
            siret: dto.siret,
            gomileCode,
            wallet: { create: { balance: 0 } },
          },
        },
      },
    });

    // Create DriverDocument records for any provided file URLs
    const documents: { type: DocumentType; url: string }[] = [];
    if (dto.cniFile)
      documents.push({ type: DocumentType.CNI, url: dto.cniFile });
    if (dto.justificatifFile)
      documents.push({ type: DocumentType.OTHER, url: dto.justificatifFile });
    if (dto.permisFile)
      documents.push({
        type: DocumentType.DRIVING_LICENSE,
        url: dto.permisFile,
      });
    if (dto.carteGriseFile)
      documents.push({
        type: DocumentType.REGISTRATION_CARD,
        url: dto.carteGriseFile,
      });
    if (dto.kbisFile)
      documents.push({ type: DocumentType.OTHER, url: dto.kbisFile });
    if (dto.ribFile)
      documents.push({ type: DocumentType.RIB, url: dto.ribFile });

    if (documents.length > 0) {
      await this.prisma.driverDocument.createMany({
        data: documents.map((doc) => ({ ...doc, driverId: user.id })),
      });
    }

    // Just like merchants, drivers should have their accounts email verified
    const verifyUrl = `${process.env.APP_URL ?? DEFAULT_APP_URL}/verify-email?token=${token}`;
    await this.emailService.sendVerificationEmail(
      user.email,
      dto.firstName,
      verifyUrl,
    );

    return this.generateAndSaveTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = this.isEmail(dto.identifier)
      ? await this.prisma.user.findUnique({
          where: { email: dto.identifier.toLowerCase() },
        })
      : await this.prisma.user.findUnique({
          where: { phone: dto.identifier },
        });

    if (!user)
      throw new UnauthorizedException(
        createApiError('INVALID_CREDENTIALS', AUTH_ERRORS),
      );

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch)
      throw new UnauthorizedException(
        createApiError('INVALID_CREDENTIALS', AUTH_ERRORS),
      );

    // Disable temporary to fix domain issues
    if (!user.emailVerified)
      throw new UnauthorizedException(
        createApiError('EMAIL_NOT_VERIFIED', AUTH_ERRORS),
      );

    return this.generateAndSaveTokens(user.id, user.email, user.role);
  }

  async refresh(
    userId: string,
    email: string,
    role: Role,
  ): Promise<AuthResponse> {
    return this.generateAndSaveTokens(userId, email, role);
  }

  async logout(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
    return { message: AUTH_MESSAGES.LOGOUT_SUCCESS };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const hash = this.hashToken(dto.token);
    const user = await this.prisma.user.findFirst({
      where: { emailVerificationToken: hash },
    });

    if (!user) {
      throw new BadRequestException(
        createApiError('INVALID_RESET_TOKEN', AUTH_ERRORS),
      );
    }
    if (!user.emailVerificationExpiry) {
      throw new BadRequestException(
        createApiError('INVALID_RESET_TOKEN', AUTH_ERRORS),
      );
    }

    if (user.emailVerificationExpiry < new Date()) {
      throw new BadRequestException(
        createApiError('INVALID_RESET_TOKEN', AUTH_ERRORS),
      );
    }

    // Remove email verification token and set status to verified, user can now login
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null,
      },
    });

    return { message: AUTH_MESSAGES.EMAIL_VERIFIED };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email.toLowerCase(),
      },
    });

    if (user) {
      const otp = randomInt(0, 1_000_000).toString().padStart(6, '0');
      const hash = this.hashToken(otp);

      // db stores hash of the token, token is valid for 1 hour
      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          passwordResetToken: hash,
          passwordResetExpiry: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      let displayName: string;

      if (user.role === Role.MERCHANT) {
        const merchant = await this.prisma.merchant.findUnique({
          where: { userId: user.id },
        });

        if (!merchant?.name) {
          throw new InternalServerErrorException(
            createApiError('NAME_IS_NULL', AUTH_ERRORS),
          );
        }

        displayName = merchant.name;
      } else {
        const driver = await this.prisma.driver.findUnique({
          where: { userId: user.id },
        });
        if (!driver?.firstName) {
          throw new InternalServerErrorException(
            createApiError('NAME_IS_NULL', AUTH_ERRORS),
          );
        }
        displayName = driver.firstName;
      }

      await this.emailService.sendPasswordReset(user.email, displayName, otp);
    }

    return { message: AUTH_MESSAGES.FORGOT_PASSWORD_SENT };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new BadRequestException(
        createApiError('INVALID_RESET_TOKEN', AUTH_ERRORS),
      );
    }
    if (!user.passwordResetToken || !user.passwordResetExpiry) {
      throw new BadRequestException(
        createApiError('INVALID_RESET_TOKEN', AUTH_ERRORS),
      );
    }

    if (user.passwordResetExpiry < new Date()) {
      throw new BadRequestException(
        createApiError('INVALID_RESET_TOKEN', AUTH_ERRORS),
      );
    }

    const hash = this.hashToken(dto.otp);
    if (hash !== user.passwordResetToken) {
      throw new BadRequestException(
        createApiError('INVALID_RESET_TOKEN', AUTH_ERRORS),
      );
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenHash = this.hashToken(resetToken);

    // Reset token expires after 15 minutes
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetTokenHash,
        passwordResetExpiry: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return { resetToken };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new BadRequestException(
        createApiError('INVALID_RESET_TOKEN', AUTH_ERRORS),
      );
    }
    if (!user.passwordResetToken || !user.passwordResetExpiry) {
      throw new BadRequestException(
        createApiError('INVALID_RESET_TOKEN', AUTH_ERRORS),
      );
    }

    if (user.passwordResetExpiry < new Date()) {
      throw new BadRequestException(
        createApiError('INVALID_RESET_TOKEN', AUTH_ERRORS),
      );
    }

    const hash = this.hashToken(dto.resetToken);
    if (hash !== user.passwordResetToken) {
      throw new BadRequestException(
        createApiError('INVALID_RESET_TOKEN', AUTH_ERRORS),
      );
    }

    const hashedPassword = await this.hashPassword(dto.newPassword);

    // Remove password token and update password
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        refreshToken: null,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    return { message: AUTH_MESSAGES.PASSWORD_RESET_SUCCESS };
  }

  // Check if the string is an email
  private isEmail(identifier: string): boolean {
    return identifier.includes('@');
  }
  // Check if email is available
  private async checkEmailAvailable(email: string) {
    if (!this.isEmail(email)) {
      throw new BadRequestException(
        createApiError('INVALID_EMAIL', AUTH_ERRORS),
      );
    }
    const existing = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existing)
      throw new ConflictException(
        createApiError('EMAIL_ALREADY_USED', AUTH_ERRORS),
      );
  }

  // Check if phone number is available
  private async checkPhoneAvailable(phone: string) {
    const existing = await this.prisma.user.findUnique({ where: { phone } });
    if (existing)
      throw new ConflictException(
        createApiError('PHONE_ALREADY_USED', AUTH_ERRORS),
      );
  }

  private async generateUniqueGomileCode(): Promise<string> {
    const year = new Date().getFullYear();
    while (true) {
      const suffix = randomBytes(3).toString('hex').toUpperCase();
      const code = `GM-${suffix}-${year}`;
      const existing = await this.prisma.driver.findUnique({
        where: { gomileCode: code },
      });
      if (!existing) return code;
    }
  }

  private async generateAndSaveTokens(
    userId: string,
    email: string,
    role: Role,
  ): Promise<AuthResponse> {
    const payload = { sub: userId, email, role };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: '15m',
        jwtid: randomUUID(),
      }),
      this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: '7d',
        jwtid: randomUUID(),
      }),
    ]);

    await this.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: this.hashToken(refreshToken) },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, role },
    };
  }
}
