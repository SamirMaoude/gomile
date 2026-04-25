import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { createApiError } from '../common/api-error';
import { STORE_ERRORS } from './store-errors';
import { AUTH_ERRORS } from '../auth/auth-errors';
import { UpdateStoreResponseDto } from './dto/update-store.response.dto';
import { STORE_MESSAGES } from './store-messages';
import { CreateStoreResponseDto } from './dto/create-store-response.dto';
import { DeleteStoreResponseDto } from './dto/delete-store-response.dto';
import { AuthenticatedUser } from '../auth/auth.types';
import { OrderStatus, Role, SubscriptionStatus } from '@prisma/client';
import { SUBSCRIPTION_ERRORS } from '../subscription/subscription.errors';
import { TIER_LIMITS } from '../subscription/subscription.config';

@Injectable()
export class StoreService {
  constructor(private prisma: PrismaService) {}

  // Defining statuses that define a store is active
  private activeStatuses = [
    OrderStatus.SEARCHING_DRIVER,
    OrderStatus.DRIVER_ACCEPTED,
    OrderStatus.DRIVER_ASSIGNED,
    OrderStatus.PICKED_UP,
  ];
  // Verify existant of the merchant
  private async existsMerchant(merchantId: string) {
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
  private async existsStore(storeId: string) {
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

  // Verify ownership of a merchant over a store
  private async verifyOwnership(merchantId: string, storeId: string) {
    const response = await this.prisma.store.findFirst({
      where: { id: storeId, merchantId },
    });
    if (!response) {
      throw new ForbiddenException(createApiError('NOT_OWNER', STORE_ERRORS));
    }
    return response;
  }

  // Verify active orders, check if a store has any ongoing orders or not
  // Returns the first active order found, not the most recent or anything order
  // Only to verify if certains actions on a store is allowed or not !!!!!!!!
  private async verifyActiveOrder(storeId: string) {
    const ongoingOrder = await this.prisma.order.findFirst({
      where: {
        storeId: storeId,
        status: {
          in: this.activeStatuses,
        },
      },
    });
    if (ongoingOrder) {
      throw new ConflictException(
        createApiError('STORE_HAS_ACTIVE_ORDERS', STORE_ERRORS),
      );
    }
    return ongoingOrder;
  }
  // Create stores
  async createStore(
    user: AuthenticatedUser,
    merchantId: string,
    dto: CreateStoreDto,
  ): Promise<CreateStoreResponseDto> {
    const merchant = await this.existsMerchant(merchantId);
    if (user.id !== merchantId) {
      throw new ForbiddenException(createApiError('NOT_OWNER', AUTH_ERRORS));
    }

    // Blocking merchants from using creating new stores if no subscription is active aka LOCKED
    if (merchant.subscriptionStatus === SubscriptionStatus.LOCKED) {
      throw new ForbiddenException(createApiError('SUBSCRIPTION_NOT_ACTIVE', SUBSCRIPTION_ERRORS));
    }
    // If number of stores surpasses current subscription quota, block !
    const storeCount = await this.prisma.store.count({
      where: {
        merchantId: merchantId
      }
    });
    if (storeCount >= TIER_LIMITS[merchant.subscription]) {
      throw new ForbiddenException(createApiError('SUBSCRIPTION_QUOTA_EXCEEDED', SUBSCRIPTION_ERRORS));
    }

    const store = await this.prisma.store.create({
      data: {
        name: dto.name,
        description: dto.description,
        merchantId: merchantId,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        domain: dto.domain,
        provider: dto.provider,
        webhookUrl: dto.webhookUrl,
      },
    });

    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      await this.prisma.$executeRaw`
      UPDATE "Store"
      SET location = ST_SetSRID(ST_MakePoint(${dto.longitude}, ${dto.latitude}), 4326)
      WHERE id = ${store.id}
      `;
    }
    return { name: dto.name, id: store.id };
  }

  // Update store
  async updateStore(
    user: AuthenticatedUser,
    merchantId: string,
    storeId: string,
    dto: UpdateStoreDto,
  ): Promise<UpdateStoreResponseDto> {
    if (user.id !== merchantId) {
      throw new ForbiddenException(createApiError('NOT_OWNER', AUTH_ERRORS));
    }
    await this.existsStore(storeId);
    const existing = await this.verifyOwnership(merchantId, storeId);

    // If provider is being set, ensure domain is present (in the request or already in DB)
    if (dto.provider !== undefined && !dto.domain && !existing.domain) {
      throw new BadRequestException(
        createApiError('DOMAIN_REQUIRED_WITH_PROVIDER', STORE_ERRORS),
      );
    }

    const response = await this.prisma.store.update({
      where: { id: storeId },
      data: {
        name: dto.name,
        description: dto.description,
        address: dto.address,
        latitude: dto.latitude,
        longitude: dto.longitude,
        domain: dto.domain,
        provider: dto.provider,
        webhookUrl: dto.webhookUrl,
      },
    });
    // Update PostGis location only if coordinates were provided
    if (dto.latitude !== undefined && dto.longitude !== undefined) {
      await this.prisma.$executeRaw`
      UPDATE "Store"
      SET location = ST_SetSRID(ST_MakePoint(${dto.longitude}, ${dto.latitude}), 4326)
      WHERE id = ${storeId}
      `;
    }
    return {
      name: response.name,
      id: response.id,
      message: STORE_MESSAGES.STORE_UPDATED,
    };
  }

  // Disable store
  async disableStore(
    user: AuthenticatedUser,
    merchantId: string,
    storeId: string,
  ): Promise<UpdateStoreResponseDto> {
    await this.existsMerchant(merchantId);
    if (user.id !== merchantId) {
      throw new ForbiddenException(createApiError('NOT_OWNER', AUTH_ERRORS));
    }
    await this.existsStore(storeId);
    await this.verifyOwnership(merchantId, storeId);
    await this.verifyActiveOrder(storeId);
    const response = await this.prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        isActive: false,
      },
    });
    return {
      name: response.name,
      id: storeId,
      message: STORE_MESSAGES.STORE_DISABLED,
    };
  }

  // Enable store
  async enableStore(
    user: AuthenticatedUser,
    merchantId: string,
    storeId: string,
  ): Promise<UpdateStoreResponseDto> {
    await this.existsMerchant(merchantId);
    if (user.id !== merchantId) {
      throw new ForbiddenException(createApiError('NOT_OWNER', AUTH_ERRORS));
    }
    await this.existsStore(storeId);
    const store = await this.verifyOwnership(merchantId, storeId);
    if (store.isLocked) {
      throw new ForbiddenException(createApiError('SUBSCRIPTION_NOT_ACTIVE', SUBSCRIPTION_ERRORS));
    }
    const response = await this.prisma.store.update({
      where: {
        id: storeId,
      },
      data: {
        isActive: true,
      },
    });
    return {
      name: response.name,
      id: storeId,
      message: STORE_MESSAGES.STORE_ENABLED,
    };
  }

  // Delete store
  async deleteStore(
    user: AuthenticatedUser,
    merchantId: string,
    storeId: string,
  ): Promise<DeleteStoreResponseDto> {
    await this.existsMerchant(merchantId);
    if (user.id !== merchantId) {
      throw new ForbiddenException(createApiError('NOT_OWNER', AUTH_ERRORS));
    }
    await this.existsStore(storeId);
    await this.verifyOwnership(merchantId, storeId);
    await this.verifyActiveOrder(storeId);
    await this.prisma.store.delete({
      where: {
        id: storeId,
      },
    });
    return { message: STORE_MESSAGES.STORE_DELETED };
  }

  // List stores
  async listStore(
    user: AuthenticatedUser,
    merchantId: string,
    isActive?: boolean,
  ) {
    if (user.id !== merchantId && user.role !== Role.ADMIN) {
      throw new ForbiddenException(createApiError('NOT_OWNER', AUTH_ERRORS));
    }
    return this.prisma.store.findMany({
      where: {
        merchantId,
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        _count: { select: { orders: true } },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  // Get store
  async getStore(user: AuthenticatedUser, merchantId: string, storeId: string) {
    await this.existsMerchant(merchantId);
    await this.existsStore(storeId);
    if (user.id !== merchantId) {
      throw new ForbiddenException(createApiError('NOT_OWNER', AUTH_ERRORS));
    }
    return this.verifyOwnership(merchantId, storeId);
  }
}
