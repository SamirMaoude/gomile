import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { createApiError } from '../common/api-error';
import { MERCHANT_ERRORS } from './merchant-errors';

@Injectable()
export class MerchantService {
  constructor(private prisma: PrismaService) {}

  async getMerchant(merchantId: string) {
    const result = await this.prisma.merchant.findUnique({
      where: { userId: merchantId },
      select: {
        name: true,
        createdAt: true,
        user: {
          select: {
            email: true,
            phone: true,
          },
        },
      },
    });
    if (!result) {
      throw new NotFoundException(
        createApiError('MERCHANT_NOT_FOUND', MERCHANT_ERRORS),
      );
    }
    return {
      id: merchantId,
      name: result.name,
      email: result.user.email,
      phone: result.user.phone,
      createdAt: result.createdAt,
    };
  }

  async updateMerchant(merchantId: string, dto: UpdateMerchantDto) {
    const merchant = await this.prisma.merchant.findUnique({
      where: {
        userId: merchantId,
      },
    });
    if (!merchant) {
      throw new NotFoundException(
        createApiError('MERCHANT_NOT_FOUND', MERCHANT_ERRORS),
      );
    }

    // phone number should be unique
    if (dto.phone) {
      const existing = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (existing && existing.id !== merchantId) {
        throw new ConflictException(
          createApiError('PHONE_ALREADY_USED', MERCHANT_ERRORS),
        );
      }
    }

    await this.prisma.$transaction([
      ...(dto.name
        ? [
            this.prisma.merchant.update({
              where: {
                userId: merchantId,
              },
              data: {
                name: dto.name,
              },
            }),
          ]
        : []),
      ...(dto.phone !== undefined
        ? [
            this.prisma.user.update({
              where: {
                id: merchantId,
              },
              data: {
                phone: dto.phone,
              },
            }),
          ]
        : []),
    ]);

    return {
      name: dto.name ?? merchant.name,
      phone: dto.phone,
    };
  }
}
