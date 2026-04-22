import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { RegisterDriverDto } from './dto/register-driver.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './auth.types';
import { createApiError } from './auth-errors';
import { AUTH_MESSAGES } from './auth-messages';
import { KycStatus } from '@prisma/client'
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async registerMerchant(dto: RegisterMerchantDto): Promise<AuthResponse> {
    await this.checkEmailAvailable(dto.email);
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: Role.MERCHANT,
        merchant: {
          create: { name: dto.name },
        },
      },
    });

    return this.generateAndSaveTokens(user.id, user.email, user.role);
  }

  async registerDriver(dto: RegisterDriverDto): Promise<AuthResponse> {
    await this.checkEmailAvailable(dto.email);
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const driverData = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
      dateOfBirth: new Date(dto.dateOfBirth),
      avatarUrl: dto.avatarUrl,
      gender: dto.gender,
      address: dto.address,
    };

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: Role.DRIVER,
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
    if (dto.cniFile) documents.push({ type: DocumentType.CNI, url: dto.cniFile });
    if (dto.justificatifFile) documents.push({ type: DocumentType.OTHER, url: dto.justificatifFile });
    if (dto.permisFile) documents.push({ type: DocumentType.DRIVING_LICENSE, url: dto.permisFile });
    if (dto.carteGriseFile) documents.push({ type: DocumentType.REGISTRATION_CARD, url: dto.carteGriseFile });
    if (dto.kbisFile) documents.push({ type: DocumentType.OTHER, url: dto.kbisFile });
    if (dto.ribFile) documents.push({ type: DocumentType.RIB, url: dto.ribFile });

    if (documents.length > 0) {
      await this.prisma.driverDocument.createMany({
        data: documents.map(doc => ({ ...doc, driverId: user.id })),
      });
    }

    // Just like merchants, drivers should have their accounts email verified
    const verifyUrl = `${process.env.APP_URL ?? DEFAULT_APP_URL}/verify-email?token=${token}`;
    await this.emailService.sendVerificationEmail(user.email, dto.firstName, verifyUrl);

    return this.generateAndSaveTokens(user.id, user.email, user.role);
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user)
      throw new UnauthorizedException(createApiError('INVALID_CREDENTIALS'));

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch)
      throw new UnauthorizedException(createApiError('INVALID_CREDENTIALS', AUTH_ERRORS));

    // Disable temporary to fix domain issues
    if (!user.emailVerified)
      throw new UnauthorizedException(createApiError('EMAIL_NOT_VERIFIED', AUTH_ERRORS));

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

  private async checkEmailAvailable(email: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException(createApiError('EMAIL_ALREADY_USED'));
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
      data: { refreshToken },
    });

    return {
      accessToken,
      refreshToken,
      user: { id: userId, email, role },
    };
  }
}
