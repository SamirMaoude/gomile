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
import { createApiError } from '../../../../shared/api-errors';
import { RegisterMerchantDto } from './dto/register-merchant.dto';
import { RegisterDriverDto } from './dto/register-driver.dto';
import { LoginDto } from './dto/login.dto';
import { AuthResponse } from './auth.types';

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

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: Role.DRIVER,
        driver: {
          create: {
            name: dto.name,
            phone: dto.phone,
          },
        },
      },
    });

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
      throw new UnauthorizedException(createApiError('INVALID_CREDENTIALS'));

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
    return { message: 'Déconnecté avec succès' };
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
