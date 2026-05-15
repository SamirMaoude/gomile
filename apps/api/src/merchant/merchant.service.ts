import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { createApiError } from '../common/api-error';
import { API_ERRORS } from '../common/errors';
import { OrderStatus } from '@prisma/client';
import type { AuthenticatedUser } from '../auth/auth.types';

@Injectable()
export class MerchantService {
  constructor(private prisma: PrismaService) {}

  async getMerchant(user: AuthenticatedUser, merchantId: string) {
    if (user.id !== merchantId) {
      throw new ForbiddenException(
        createApiError('NOT_OWNER', API_ERRORS),
      );
    }
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
        subscription: true,
      },
    });
    if (!result) {
      throw new NotFoundException(
        createApiError('MERCHANT_NOT_FOUND', API_ERRORS),
      );
    }
    return {
      id: merchantId,
      name: result.name,
      email: result.user.email,
      phone: result.user.phone,
      subscription: result.subscription,
      createdAt: result.createdAt,
    };
  }

  async updateMerchant(user: AuthenticatedUser, merchantId: string, dto: UpdateMerchantDto) {
    if (user.id !== merchantId) {
      throw new ForbiddenException(
        createApiError('NOT_OWNER', API_ERRORS),
      );
    }
    const merchant = await this.prisma.merchant.findUnique({
      where: {
        userId: merchantId,
      },
    });
    if (!merchant) {
      throw new NotFoundException(
        createApiError('MERCHANT_NOT_FOUND', API_ERRORS),
      );
    }

    // phone number should be unique
    if (dto.phone) {
      const existing = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });
      if (existing && existing.id !== merchantId) {
        throw new ConflictException(
          createApiError('PHONE_ALREADY_USED', API_ERRORS),
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

  async deleteMerchant(user: AuthenticatedUser, merchantId: string) {
    if (user.id !== merchantId) {
      throw new ForbiddenException(
        createApiError('NOT_OWNER', API_ERRORS),
      );
    }
    const merchant = await this.prisma.merchant.findUnique({
      where: {
        userId: merchantId,
      },
    });
    if (!merchant) {
      throw new NotFoundException(
        createApiError('MERCHANT_NOT_FOUND', API_ERRORS),
      );
    }

    const hasOngoingOrders = await this.prisma.order.findFirst({
      where: {
        store: {
          merchantId,
        },
        status: {
          in: [OrderStatus.SEARCHING_DRIVER, OrderStatus.DRIVER_ACCEPTED, OrderStatus.DRIVER_ASSIGNED, OrderStatus.PICKED_UP],
        },
      },
    });

    if (hasOngoingOrders) {
      throw new ConflictException(
        createApiError('MERCHANT_STILL_HAS_ORDERS', API_ERRORS),
      );
    }

    await this.prisma.user.delete({
      where: {
        id: merchantId,
      },
    });
  }
}
