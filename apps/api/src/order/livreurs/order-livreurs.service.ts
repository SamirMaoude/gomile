import {
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  GoneException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  Role,
  HandshakeType,
  WalletEntryType,
  WalletEntryStatus,
  Prisma,
} from '@prisma/client';
import { AuthenticatedUser } from '../../auth/auth.types';
import { createApiError } from '../../common/api-error';
import { PrismaService } from '../../prisma/prisma.service';
import { AUTH_ERRORS } from '../../auth/auth-errors';
import { ORDER_ERRORS } from '../order-errors';
import { ListDriverOrdersResponseDto } from '../dto/list-livreurs-orders-response';
import { ORDER_MESSAGE } from '../order-messages';

@Injectable()
export class OrderLivreursService {
  constructor(private prisma: PrismaService) {}
  private async existsDriver(driverId: string) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId: driverId },
    });
    if (!driver) {
      throw new NotFoundException(
        createApiError('DRIVER_NOT_FOUND', AUTH_ERRORS),
      );
    }
    return driver;
  }

  private async existsOrder(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });
    if (!order) {
      throw new NotFoundException(
        createApiError('ORDER_NOT_FOUND', ORDER_ERRORS),
      );
    }
    return order;
  }

  async listDriverOrders(
    user: AuthenticatedUser,
    driverId: string,
    filter?: 'active' | 'finished' | 'cancelled',
  ): Promise<ListDriverOrdersResponseDto[]> {
    await this.existsDriver(driverId);
    if (user.id !== driverId && user.role !== Role.ADMIN) {
      throw new ForbiddenException(createApiError('NOT_OWNER', ORDER_ERRORS));
    }

    const where: Prisma.OrderWhereInput = { driverId };
    switch (filter) {
      case 'active':
        where.status = {
          in: [OrderStatus.DRIVER_ACCEPTED, OrderStatus.PICKED_UP],
        };
        break;
      case 'finished':
        where.status = OrderStatus.DELIVERED;
        break;
      case 'cancelled':
        where.status = OrderStatus.CANCELLED;
        break;
    }

    return this.prisma.order.findMany({
      where,
      select: {
        id: true,
        storeId: true,
        merchantId: true,
        customerName: true,
        dropOffAddress: true,
        status: true,
        createdAt: true,
        acceptedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }) as Promise<ListDriverOrdersResponseDto[]>;
  }

  async acceptOrder(
    user: AuthenticatedUser,
    driverId: string,
    orderId: string,
  ) {
    await this.existsDriver(driverId);
    if (user.id !== driverId) {
      throw new ForbiddenException(createApiError('NOT_OWNER', ORDER_ERRORS));
    }

    const result = await this.prisma.order.updateMany({
      where: {
        id: orderId,
        status: OrderStatus.SEARCHING_DRIVER,
        driverId: null,
      },
      data: {
        driverId,
        status: OrderStatus.DRIVER_ACCEPTED,
        acceptedAt: new Date(),
      },
    });

    if (result.count === 0) {
      await this.existsOrder(orderId);
      throw new ConflictException(
        createApiError('ORDER_ALREADY_TAKEN', ORDER_ERRORS),
      );
    }

    const handshake = await this.prisma.handshake.findUnique({
      where: { orderId_type: { orderId, type: HandshakeType.A } },
    });

    if (!handshake) {
      throw new InternalServerErrorException(
        createApiError('HANDSHAKE_NOT_FOUND', ORDER_ERRORS),
      );
    }

    // Driver should present to the merchant presenting the pickup code
    return {
      pickupCode: handshake?.code,
      message: ORDER_MESSAGE.ORDER_ACCEPTED,
    };
  }

  // Get pickup code for a driver and an order
  async getPickupCode(
    user: AuthenticatedUser,
    driverId: string,
    orderId: string,
  ) {
    await this.existsDriver(driverId);
    if (user.id !== driverId) {
      throw new ForbiddenException(createApiError('NOT_OWNER', ORDER_ERRORS));
    }

    const order = await this.existsOrder(orderId);

    if (order.driverId !== driverId) {
      throw new ForbiddenException(createApiError('NOT_OWNER', ORDER_ERRORS));
    }

    if (order.status !== OrderStatus.DRIVER_ACCEPTED) {
      throw new ConflictException(
        createApiError('ORDER_PICKUP_NO_LONGER_AVAILABLE', ORDER_ERRORS),
      );
    }

    const handshake = await this.prisma.handshake.findUnique({
      where: { orderId_type: { orderId, type: HandshakeType.A } },
    });

    if (!handshake) {
      throw new InternalServerErrorException(
        createApiError('HANDSHAKE_NOT_FOUND', ORDER_ERRORS),
      );
    }

    if (handshake.expiresAt.getTime() < Date.now()) {
      throw new GoneException(
        createApiError('HANDSHAKE_EXPIRED', ORDER_ERRORS),
      );
    }

    return { pickupCode: handshake.code };
  }

  async pickupOrder(
    user: AuthenticatedUser,
    driverId: string,
    orderId: string,
    pickupCode: string,
  ) {
    await this.existsDriver(driverId);
    if (user.id !== driverId) {
      throw new ForbiddenException(createApiError('NOT_OWNER', ORDER_ERRORS));
    }
    const order = await this.existsOrder(orderId);

    if (order.status === OrderStatus.CANCELLED) {
      throw new ConflictException(
        createApiError('ORDER_ALREADY_CANCELLED', ORDER_ERRORS),
      );
    }

    if (order.status === OrderStatus.PICKED_UP) {
      throw new ConflictException(
        createApiError('ORDER_PICKUP_NO_LONGER_AVAILABLE', ORDER_ERRORS),
      );
    }

    if (order.status !== OrderStatus.DRIVER_ACCEPTED) {
      throw new InternalServerErrorException(
        createApiError('ORDER_BAD_STATUS', ORDER_ERRORS),
      );
    }

    if (order.driverId !== driverId) {
      throw new ForbiddenException(createApiError('NOT_OWNER', ORDER_ERRORS));
    }

    const handshake = await this.prisma.handshake.findUnique({
      where: {
        orderId_type: {
          orderId,
          type: HandshakeType.A,
        },
      },
    });

    if (!handshake) {
      throw new InternalServerErrorException(
        createApiError('HANDSHAKE_NOT_FOUND', ORDER_ERRORS),
      );
    }

    const remainingAttemps = handshake.remainingAttemps;

    if (handshake.expiresAt.getTime() < Date.now()) {
      throw new GoneException(
        createApiError('HANDSHAKE_EXPIRED', ORDER_ERRORS),
      );
    }

    if (remainingAttemps === 0) {
      throw new HttpException(
        createApiError('HANDSHAKE_ATTEMPTS_PASSED', ORDER_ERRORS),
        429,
      );
    }

    // Check database if code is correct
    if (handshake.code !== pickupCode) {
      // decrease attemps
      await this.prisma.handshake.update({
        where: {
          id: handshake.id,
        },
        data: {
          remainingAttemps: remainingAttemps - 1,
        },
      });
      throw new UnauthorizedException(
        createApiError('INCORRECT_HANDSHAKE_CODE', ORDER_ERRORS),
      );
    }
    const today = new Date();
    // Change handshake signature
    await this.prisma.handshake.update({
      where: {
        orderId_type: {
          orderId,
          type: HandshakeType.A,
        },
      },
      data: {
        verifiedAt: today,
      },
    });
    // And update order as well
    await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        pickedUpAt: today,
        status: OrderStatus.PICKED_UP,
      },
    });
    return { orderId: orderId, message: ORDER_MESSAGE.ORDER_PICKED_UP };
  }

  // deliver order
  async deliverOrder(
    user: AuthenticatedUser,
    driverId: string,
    orderId: string,
    deliveryCode: string,
  ) {
    await this.existsDriver(driverId);
    if (user.id !== driverId) {
      throw new ForbiddenException(createApiError('NOT_OWNER', ORDER_ERRORS));
    }

    const order = await this.existsOrder(orderId);

    if (order.status === OrderStatus.CANCELLED) {
      throw new ConflictException(
        createApiError('ORDER_ALREADY_CANCELLED', ORDER_ERRORS),
      );
    }

    if (order.status === OrderStatus.DELIVERED) {
      throw new ConflictException(
        createApiError('ORDER_ALREADY_DELIVERED', ORDER_ERRORS),
      );
    }

    if (order.status !== OrderStatus.PICKED_UP) {
      throw new InternalServerErrorException(
        createApiError('ORDER_BAD_STATUS', ORDER_ERRORS),
      );
    }

    const handshake = await this.prisma.handshake.findUnique({
      where: {
        orderId_type: {
          orderId,
          type: HandshakeType.B,
        },
      },
    });

    if (!handshake) {
      throw new InternalServerErrorException(
        createApiError('HANDSHAKE_NOT_FOUND', ORDER_ERRORS),
      );
    }

    const remainingAttemps = handshake.remainingAttemps;

    if (handshake.expiresAt.getTime() < Date.now()) {
      throw new GoneException(
        createApiError('HANDSHAKE_EXPIRED', ORDER_ERRORS),
      );
    }

    if (remainingAttemps === 0) {
      throw new HttpException(
        createApiError('HANDSHAKE_ATTEMPTS_PASSED', ORDER_ERRORS),
        429,
      );
    }

    if (handshake.code !== deliveryCode) {
      await this.prisma.handshake.update({
        where: {
          id: handshake.id,
        },
        data: {
          remainingAttemps: remainingAttemps - 1,
        },
      });
      throw new UnauthorizedException(
        createApiError('INCORRECT_HANDSHAKE_CODE', ORDER_ERRORS),
      );
    }

    const today = new Date();

    await this.prisma.handshake.update({
      where: { id: handshake.id },
      data: { verifiedAt: today },
    });

    const deliveredOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: { deliveredAt: today, status: OrderStatus.DELIVERED },
    });

    // Credit driver wallet with reward
    if (deliveredOrder.reward) {
      const wallet = await this.prisma.wallet.findUnique({
        where: { driverId },
      });

      if (wallet) {
        await this.prisma.$transaction([
          this.prisma.walletEntry.create({
            data: {
              walletId: wallet.id,
              amount: deliveredOrder.reward,
              type: WalletEntryType.CREDIT,
              status: WalletEntryStatus.COMPLETED,
            },
          }),
          this.prisma.wallet.update({
            where: {
              id: wallet.id,
            },
            data: {
              balance: {
                increment: deliveredOrder.reward,
              },
            },
          }),
          this.prisma.driver.update({
            where: {
              userId: driverId,
            },
            data: {
              totalTrips: {
                increment: 1,
              },
            },
          }),
        ]);
      }
    }

    return { orderId: orderId, message: ORDER_MESSAGE.ORDER_DELIVERED };
  }
}
