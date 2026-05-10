import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { createApiError } from '../common/api-error';
import { AUTH_ERRORS } from '../auth/auth-errors';
import { ADMIN_ERRORS } from './admin.errors';
import { ADMIN_MESSAGES } from './admin.message';
import { ORDER_ERRORS } from 'src/order/order-errors';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}
  // return all drivers
  async getAllDrivers() {
    return this.prisma.driver.findMany({
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        status: true,
        kycStatus: true,
        kycSubmissions: {
          select: {
            id: true,
            status: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        totalTrips: true,
        gomileCode: true,
        user: {
          select: { email: true, phone: true },
        },
      },
    });
  }

  async getDriver(driverId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId: driverId },
      select: {
        userId: true,
        firstName: true,
        lastName: true,
        dateOfBirth: true,
        gender: true,
        address: true,
        city: true,
        zipCode: true,
        street: true,
        deliveryCity: true,
        deliveryRadius: true,
        transportType: true,
        activeVehicle: true,
        status: true,
        kycStatus: true,
        rating: true,
        totalTrips: true,
        gomileCode: true,
        siret: true,
        createdAt: true,
        user: {
          select: { email: true, phone: true },
        },
        driverDocuments: {
          select: {
            id: true,
            type: true,
            url: true,
            verified: true,
            rejectionReason: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        kycSubmissions: {
          select: {
            id: true,
            status: true,
            rejectionReason: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        wallet: {
          select: { balance: true },
        },
      },
    });

    if (!driver) {
      throw new NotFoundException(
        createApiError('DRIVER_NOT_FOUND', AUTH_ERRORS),
      );
    }

    return driver;
  }

  async getWithdrawals(
    userId?: string,
    status?: 'PENDING' | 'COMPLETED' | 'CANCELLED',
  ) {
    return this.prisma.walletEntry.findMany({
      where: {
        type: 'DEBIT',
        ...(status && { status }),
        ...(userId && { userId: userId }),
      },
      select: {
        id: true,
        amount: true,
        status: true,
        createdAt: true,
        wallet: {
          select: {
            driver: {
              select: {
                userId: true,
                firstName: true,
                lastName: true,
                user: { select: { email: true } },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateWithdrawal(entryId: string, status: 'COMPLETED' | 'CANCELLED') {
    const entry = await this.prisma.walletEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) {
      throw new NotFoundException(
        createApiError('WITHDRAWAL_NOT_FOUND', ADMIN_ERRORS),
      );
    }

    if (entry.status !== 'PENDING') {
      throw new ConflictException(
        createApiError('WITHDRAWAL_NOT_PENDING', ADMIN_ERRORS),
      );
    }

    await this.prisma.$transaction([
      this.prisma.walletEntry.update({
        where: {
          id: entryId,
        },
        data: {
          status,
        },
      }),
      ...(status === 'CANCELLED'
        ? [
            this.prisma.wallet.update({
              where: { id: entry.walletId },
              data: { balance: { increment: entry.amount } },
            }),
          ]
        : []),
    ]);

    return {
      message:
        status === 'COMPLETED'
          ? ADMIN_MESSAGES.WITHDRAWAL_COMPLETED
          : ADMIN_MESSAGES.WITHDRAWAL_CANCELLED,
    };
  }

  async unlockHandshake(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: {
        id : orderId
      }
    });

    if (!order) {
      throw new NotFoundException(createApiError('ORDER_NOT_FOUND', ORDER_ERRORS))
    }

    await this.prisma.handshake.updateMany({
      where: {
        orderId: orderId
      },
      data: {
        remainingAttemps: 3
      }
    })
    return { message: 'Order handshake has been reset successfully' }
  }
}
