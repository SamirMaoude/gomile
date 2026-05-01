import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NotificationService } from '../../notification/notification.service';
import { OutboundWebhookService } from '../../webhook/outbound-webhook.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { AuthenticatedUser } from '../../auth/auth.types';
import { createApiError } from '../../common/api-error';
import { STORE_ERRORS } from '../../store/store-errors';
import { CreateOrderResponseDto } from '../dto/create-order-response';
import { ORDER_MESSAGE } from '../order-messages';
import { AUTH_ERRORS } from '../../auth/auth-errors';
import { ORDER_ERRORS } from '../order-errors';
import { GetOrderResponseDto } from '../dto/get-order-response.dto';
import { Merchant, Order, Store } from '@prisma/client';
import { Role } from '@prisma/client';
import { ListMerchantOrdersResponseDto } from '../dto/list-merchant-orders-response';
import { HandshakeType, OrderStatus } from '@prisma/client';
import { CancelOrderResponseDto } from '../dto/cancel-order-response';
import { randomInt } from 'crypto';
import { OpenRouteService } from '../../delivery/openrouteservice.service';
import { DeliveryPricingService } from '../../delivery/delivery-pricing.service';
import { SmsService } from '../../sms/sms.service';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    private prisma: PrismaService,
    private readonly openRouteService: OpenRouteService,
    private readonly deliveryPricingService: DeliveryPricingService,
    private readonly notificationService: NotificationService,
    private readonly outboundWebhook: OutboundWebhookService,
    private readonly smsService: SmsService,
  ) {}
  private handshakeTTL = 12 * 60 * 60 * 1000; // 12h for short deliveries, or maybe less

  // Verify existant of the merchant
  private async existsMerchant(merchantId: string): Promise<Merchant> {
    const merchant = await this.prisma.merchant.findUnique({
      where: {
        userId: merchantId,
      },
    });
    if (!merchant) {
      throw new NotFoundException(
        createApiError('MERCHANT_NOT_FOUND', AUTH_ERRORS),
      );
    }
    return merchant;
  }

  // Verify existant of the store
  private async existsStore(storeId: string): Promise<Store> {
    const store = await this.prisma.store.findUnique({
      where: {
        id: storeId,
      },
    });
    if (!store) {
      throw new NotFoundException(
        createApiError('STORE_NOT_FOUND', STORE_ERRORS),
      );
    }
    return store;
  }

  // Verify existant of the order
  private async existsOrder(orderId: string): Promise<Order> {
    const order = await this.prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });
    if (!order) {
      throw new NotFoundException(
        createApiError('ORDER_NOT_FOUND', ORDER_ERRORS),
      );
    }
    return order;
  }

  // Verify ownership of a merchant over a store
  private async verifyStoreOwnership(merchantId: string, storeId: string) {
    const response = await this.prisma.store.findFirst({
      where: { id: storeId, merchantId },
    });
    if (!response) {
      throw new ForbiddenException(createApiError('NOT_OWNER', STORE_ERRORS));
    }
    return response;
  }

  // Verify ownership of a merchant over his orders
  private async verifyOrderOwnership(merchantId: string, orderId: string) {
    const response = await this.prisma.order.findFirst({
      where: {
        id: orderId,
        merchantId: merchantId,
      },
    });
    if (!response) {
      throw new ForbiddenException(createApiError('NOT_OWNER', ORDER_ERRORS));
    }
    return response;
  }

  async createOrder(
    user: AuthenticatedUser | null,
    storeId: string,
    merchantId: string,
    dto: CreateOrderDto,
  ): Promise<CreateOrderResponseDto> {
    await this.existsMerchant(merchantId);
    if (user && user.id !== merchantId) {
      throw new ForbiddenException(createApiError('NOT_OWNER', AUTH_ERRORS));
    }
    const store = await this.existsStore(storeId);
    await this.verifyStoreOwnership(merchantId, storeId);

    // geocode dropoff and compute route from store coordinates
    const dropoff = await this.openRouteService.geocodeAddress(
      dto.dropOffAddress,
    );
    const route = await this.openRouteService.getDrivingRoute(
      { latitude: store.latitude, longitude: store.longitude },
      dropoff,
    );

    const { deliveryFee, reward, distanceKm } =
      this.deliveryPricingService.calculate({
        distanceMeters: route.distanceMeters,
        weightKg: dto.weight,
        packageSize: dto.packageSize,
      });

    const pickupCode = randomInt(0, 1000000).toString().padStart(6, '0');
    const deliveryCode = randomInt(0, 1000000).toString().padStart(6, '0');
    const expiresAt = new Date(Date.now() + this.handshakeTTL);

    const order = await this.prisma.order.create({
      data: {
        merchantId,
        storeId,
        customerName: dto.customerName,
        customerPhone: dto.customerPhone,
        dropOffAddress: dto.dropOffAddress,
        type: dto.type,
        packageSize: dto.packageSize,
        weight: dto.weight,
        orderReference: dto.orderReference,
        deliveryFee,
        reward,
        distanceKm,
        handshakes: {
          createMany: {
            data: [
              { type: HandshakeType.A, code: pickupCode, expiresAt },
              { type: HandshakeType.B, code: deliveryCode, expiresAt },
            ],
          },
        },
      },
    });

    // Notify customer by SMS that their order has been received
    await this.smsService
      .sendSms(order.customerPhone, `Votre commande GoMile a bien été reçue. Un livreur va bientôt la prendre en charge.`)
      .catch((err) => this.logger.error('SMS on order creation failed', err));

    // Expo push notification notifies nearby drivers
    await this.findNearbyDriverTokens(store.latitude, store.longitude)
      .then((tokens) =>
        this.notificationService.notifyDrivers(
          tokens,
          order.id,
          dto.customerName,
          dto.type,
          store.address,
          reward,
          distanceKm,
        ),
      )
      .catch((err) => this.logger.error('Failed to notify nearby drivers', err));

    return {
      orderId: order.id,
      deliveryCode,
      deliveryFee,
      distanceKm,
      status: order.status,
      message: ORDER_MESSAGE.ORDER_CREATED,
    };
  }

  // Given a point, returns all drivers whose positions with deliveryRadius covers that point
  private async findNearbyDriverTokens(lat: number, lng: number): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<{ expoPushToken: string }[]>`
      SELECT d."expoPushToken"
      FROM "Driver" d
      WHERE d.status = 'AVAILABLE'
        AND d."kycStatus" = 'ACCEPTED'
        AND d."expoPushToken" IS NOT NULL
        AND d."lastKnownLocation" IS NOT NULL
        AND ST_DWithin(
          d."lastKnownLocation"::geography,
          ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)::geography,
          d."deliveryRadius" * 1000
        )
    `;
    return rows.map((r) => r.expoPushToken);
  }

  async getMerchantOrders(
    user: AuthenticatedUser | null,
    merchantId: string,
    orderReference?: string,
  ): Promise<ListMerchantOrdersResponseDto[]> {
    await this.existsMerchant(merchantId);
    if (user && user.id !== merchantId && user.role !== Role.ADMIN) {
      throw new ForbiddenException(createApiError('NOT_OWNER', AUTH_ERRORS));
    }
    return (await this.prisma.order.findMany({
      where: {
        merchantId,
        ...(orderReference && { orderReference }),
      },
      select: {
        id: true,
        storeId: true,
        status: true,
        customerName: true,
        dropOffAddress: true,
        createdAt: true,
        driverId: true,
        orderReference: true,
      },
      orderBy: { createdAt: 'desc' },
    })) as ListMerchantOrdersResponseDto[];
  }

  async getOrder(
    user: AuthenticatedUser | null,
    merchantId: string,
    orderId: string,
  ): Promise<GetOrderResponseDto> {
    await this.existsMerchant(merchantId);
    if (user && user.id !== merchantId && user.role !== Role.ADMIN) {
      throw new ForbiddenException(createApiError('NOT_OWNER', ORDER_ERRORS));
    }
    const order = await this.verifyOrderOwnership(merchantId, orderId);
    return {
      orderId: order.id,
      storeId: order.storeId,
      driverId: order.driverId,
      status: order.status,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      dropOffAddress: order.dropOffAddress,
      createdAt: order.createdAt,
      acceptedAt: order.acceptedAt,
      pickedUpAt: order.pickedUpAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
    };
  }

  async cancelOrder(
    user: AuthenticatedUser | null,
    merchantId: string,
    orderId: string,
  ): Promise<CancelOrderResponseDto> {
    await this.existsMerchant(merchantId);

    if (user && user.id !== merchantId && user.role !== Role.ADMIN) {
      throw new ForbiddenException(createApiError('NOT_OWNER', AUTH_ERRORS));
    }

    const order = await this.verifyOrderOwnership(merchantId, orderId);
    if (order.status === OrderStatus.CANCELLED) {
      throw new ConflictException(
        createApiError('ORDER_ALREADY_CANCELLED', ORDER_ERRORS),
      );
    }
    if (
      order.status === OrderStatus.PICKED_UP ||
      order.status === OrderStatus.DELIVERED
    ) {
      throw new ConflictException(
        createApiError('ORDER_ALREADY_PICKED_UP', ORDER_ERRORS),
      );
    }

    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });
    this.outboundWebhook.fireOrderEvent(orderId, OrderStatus.CANCELLED);
    return { message: ORDER_MESSAGE.ORDER_CANCELLED };
  }

  // cancel by order reference, use for WooCommerce, Shopify or any other plugins that has its own order id
  async cancelOrderByReference(
    merchantId: string,
    orderReference: string,
  ): Promise<CancelOrderResponseDto> {
    await this.existsMerchant(merchantId);

    const order = await this.prisma.order.findFirst({
      where: { merchantId, orderReference },
    });

    if (!order) {
      throw new NotFoundException(
        createApiError('ORDER_NOT_FOUND', ORDER_ERRORS),
      );
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new ConflictException(
        createApiError('ORDER_ALREADY_CANCELLED', ORDER_ERRORS),
      );
    }

    if (
      order.status === OrderStatus.PICKED_UP ||
      order.status === OrderStatus.DELIVERED
    ) {
      throw new ConflictException(
        createApiError('ORDER_ALREADY_PICKED_UP', ORDER_ERRORS),
      );
    }

    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.CANCELLED, cancelledAt: new Date() },
    });
    this.outboundWebhook.fireOrderEvent(order.id, OrderStatus.CANCELLED);
    return { message: ORDER_MESSAGE.ORDER_CANCELLED };
  }

  // Verify pickup code given by the driver
  async verifyPickup(
    user: AuthenticatedUser,
    merchantId: string,
    storeId: string,
    code: string,
  ) {
    await this.existsMerchant(merchantId);

    if (user.id !== merchantId) {
      throw new ForbiddenException(createApiError('NOT_OWNER', AUTH_ERRORS));
    }

    const store = await this.existsStore(storeId);
    if (store.merchantId !== merchantId) {
      throw new ForbiddenException(createApiError('NOT_OWNER', STORE_ERRORS));
    }

    const handshake = await this.prisma.handshake.findFirst({
      where: {
        code,
        type: HandshakeType.A,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
        order: { storeId },
      },
      include: { order: true },
    });

    if (!handshake) {
      throw new NotFoundException(
        createApiError('HANDSHAKE_NOT_FOUND', ORDER_ERRORS),
      );
    }

    if (handshake.remainingAttemps === 0) {
      throw new HttpException(
        createApiError('HANDSHAKE_ATTEMPTS_PASSED', ORDER_ERRORS),
        429,
      );
    }

    if (handshake.order.status !== OrderStatus.DRIVER_ACCEPTED) {
      throw new ConflictException(
        createApiError('ORDER_BAD_STATUS', ORDER_ERRORS),
      );
    }

    const now = new Date();
    await this.prisma.handshake.update({
      where: { id: handshake.id },
      data: { verifiedAt: now },
    });

    await this.prisma.order.update({
      where: { id: handshake.orderId },
      data: { status: OrderStatus.PICKED_UP, pickedUpAt: now },
    });
    return {
      orderId: handshake.orderId,
      orderReference: handshake.order.orderReference,
      message: ORDER_MESSAGE.ORDER_PICKED_UP,
    };
  }
}
