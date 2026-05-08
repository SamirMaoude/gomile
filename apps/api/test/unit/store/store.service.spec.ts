import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { StoreService } from 'src/store/store.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { OpenRouteService } from 'src/delivery/openrouteservice.service';
import { Role, OrderStatus, SubscriptionStatus } from '@prisma/client';

const mockPrisma = {
  merchant: { findUnique: jest.fn() },
  store: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  order: { findFirst: jest.fn() },
  $executeRaw: jest.fn().mockResolvedValue(1),
};

const mockOrs = {
  resolveAddress: jest.fn().mockResolvedValue({ latitude: 48.8566, longitude: 2.3522 }),
};

const merchantUser = { id: 'merchant1', email: 'merchant@test.com', role: Role.MERCHANT };
const otherUser = { id: 'other', email: 'other@test.com', role: Role.MERCHANT };

const baseMerchant = {
  userId: 'merchant1',
  subscription: 'FREE',
  subscriptionStatus: SubscriptionStatus.ACTIVE,
};
const baseStore = { id: 'store1', merchantId: 'merchant1', isActive: true, isLocked: false, name: 'Boutique' };

describe('StoreService', () => {
  let service: StoreService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StoreService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: OpenRouteService, useValue: mockOrs },
      ],
    }).compile();

    service = module.get(StoreService);
  });

  describe('createStore', () => {
    const dto = { name: 'Shop', address: '1 Rue Test, Paris', description: null, domain: null, provider: null };

    beforeEach(() => {
      mockPrisma.merchant.findUnique.mockResolvedValue({ ...baseMerchant });
      mockPrisma.store.count.mockResolvedValue(0);
      mockPrisma.store.create.mockResolvedValue({ id: 'store1' });
    });

    it('creates store and returns id + name', async () => {
      const result = await service.createStore(merchantUser, 'merchant1', dto as any);
      expect(result.id).toBe('store1');
      expect(result.name).toBe('Shop');
    });

    it('throws ForbiddenException when user is not the merchant', async () => {
      await expect(service.createStore(otherUser, 'merchant1', dto as any)).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when merchant does not exist', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue(null);
      await expect(service.createStore(merchantUser, 'merchant1', dto as any)).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when subscription is LOCKED', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue({ ...baseMerchant, subscriptionStatus: SubscriptionStatus.LOCKED });
      await expect(service.createStore(merchantUser, 'merchant1', dto as any)).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when store quota is exceeded', async () => {
      // FREE tier limit is 1
      mockPrisma.store.count.mockResolvedValue(1);
      await expect(service.createStore(merchantUser, 'merchant1', dto as any)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateStore', () => {
    beforeEach(() => {
      mockPrisma.store.findUnique.mockResolvedValue(baseStore);
      mockPrisma.store.findFirst.mockResolvedValue(baseStore);
      mockPrisma.store.update.mockResolvedValue({ ...baseStore, name: 'Updated' });
    });

    it('updates store and returns updated name', async () => {
      const result = await service.updateStore(merchantUser, 'merchant1', 'store1', { name: 'Updated' } as any);
      expect(result.name).toBe('Updated');
    });

    it('throws ForbiddenException when user is not the merchant', async () => {
      await expect(
        service.updateStore(otherUser, 'merchant1', 'store1', { name: 'X' } as any),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws BadRequestException when provider is set without domain', async () => {
      mockPrisma.store.findFirst.mockResolvedValue({ ...baseStore, domain: null });
      await expect(
        service.updateStore(merchantUser, 'merchant1', 'store1', { provider: 'WOOCOMMERCE' } as any),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('disableStore', () => {
    beforeEach(() => {
      mockPrisma.merchant.findUnique.mockResolvedValue(baseMerchant);
      mockPrisma.store.findUnique.mockResolvedValue(baseStore);
      mockPrisma.store.findFirst.mockResolvedValue(baseStore);
      mockPrisma.order.findFirst.mockResolvedValue(null);
      mockPrisma.store.update.mockResolvedValue({ ...baseStore, isActive: false });
    });

    it('disables a store with no active orders', async () => {
      const result = await service.disableStore(merchantUser, 'merchant1', 'store1');
      expect(result).toHaveProperty('message');
    });

    it('throws ConflictException when store has active orders', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({ id: 'order1', status: OrderStatus.PICKED_UP });
      await expect(service.disableStore(merchantUser, 'merchant1', 'store1')).rejects.toThrow(ConflictException);
    });
  });

  describe('enableStore', () => {
    beforeEach(() => {
      mockPrisma.merchant.findUnique.mockResolvedValue(baseMerchant);
      mockPrisma.store.findUnique.mockResolvedValue(baseStore);
      mockPrisma.store.findFirst.mockResolvedValue(baseStore);
      mockPrisma.store.update.mockResolvedValue({ ...baseStore, isActive: true });
    });

    it('enables a store', async () => {
      const result = await service.enableStore(merchantUser, 'merchant1', 'store1');
      expect(result).toHaveProperty('message');
    });

    it('throws ForbiddenException when store is locked', async () => {
      mockPrisma.store.findFirst.mockResolvedValue({ ...baseStore, isLocked: true });
      await expect(service.enableStore(merchantUser, 'merchant1', 'store1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteStore', () => {
    beforeEach(() => {
      mockPrisma.merchant.findUnique.mockResolvedValue(baseMerchant);
      mockPrisma.store.findUnique.mockResolvedValue(baseStore);
      mockPrisma.store.findFirst.mockResolvedValue(baseStore);
      mockPrisma.order.findFirst.mockResolvedValue(null);
      mockPrisma.store.delete.mockResolvedValue({});
    });

    it('deletes a store with no active orders', async () => {
      const result = await service.deleteStore(merchantUser, 'merchant1', 'store1');
      expect(result).toHaveProperty('message');
    });

    it('throws ConflictException when store has active orders', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({ id: 'order1', status: OrderStatus.SEARCHING_DRIVER });
      await expect(service.deleteStore(merchantUser, 'merchant1', 'store1')).rejects.toThrow(ConflictException);
    });
  });

  describe('listStore', () => {
    it('returns stores for the merchant', async () => {
      mockPrisma.store.findMany.mockResolvedValue([baseStore]);
      const result = await service.listStore(merchantUser, 'merchant1');
      expect(result).toHaveLength(1);
    });

    it('throws ForbiddenException for non-owner non-admin', async () => {
      await expect(service.listStore(otherUser, 'merchant1')).rejects.toThrow(ForbiddenException);
    });

    it('allows admin to list any merchant stores', async () => {
      const admin = { id: 'admin1', email: 'admin@test.com', role: Role.ADMIN };
      mockPrisma.store.findMany.mockResolvedValue([baseStore]);
      const result = await service.listStore(admin, 'merchant1');
      expect(result).toHaveLength(1);
    });
  });

  describe('configureWebhook', () => {
    it('sets webhook url and returns secret', async () => {
      mockPrisma.store.findFirst.mockResolvedValue(baseStore);
      mockPrisma.store.update.mockResolvedValue({});
      const result = await service.configureWebhook(merchantUser, 'merchant1', 'store1', 'https://example.com/wh');
      expect(result.webhookUrl).toBe('https://example.com/wh');
      expect(result.webhookSecret).toHaveLength(64);
    });

    it('throws ForbiddenException when user is not the merchant', async () => {
      await expect(
        service.configureWebhook(otherUser, 'merchant1', 'store1', 'https://x.com'),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getStore', () => {
    it('returns store when found and owned', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue(baseMerchant);
      mockPrisma.store.findUnique.mockResolvedValue(baseStore);
      mockPrisma.store.findFirst.mockResolvedValue(baseStore);
      const result = await service.getStore(merchantUser, 'merchant1', 'store1');
      expect(result.id).toBe('store1');
    });

    it('throws ForbiddenException when store not owned', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue(baseMerchant);
      mockPrisma.store.findUnique.mockResolvedValue(baseStore);
      mockPrisma.store.findFirst.mockResolvedValue(null);
      await expect(service.getStore(merchantUser, 'merchant1', 'store1')).rejects.toThrow(ForbiddenException);
    });
  });
});
