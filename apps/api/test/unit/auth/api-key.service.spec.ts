import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ForbiddenException, NotFoundException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { ApiKeyService } from 'src/auth/api-key.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

const mockPrisma = {
  store: { findFirst: jest.fn() },
  merchantApiKey: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation((ops) =>
    Array.isArray(ops) ? Promise.all(ops) : ops(mockPrisma),
  ),
};

const merchantUser = { id: 'merchant1', email: 'merchant@test.com', role: Role.MERCHANT };
const otherUser = { id: 'other', email: 'other@test.com', role: Role.MERCHANT };

describe('ApiKeyService', () => {
  let service: ApiKeyService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(ApiKeyService);
  });

  describe('createApiKey', () => {
    beforeEach(() => {
      mockPrisma.store.findFirst.mockResolvedValue({ id: 'store1', merchantId: 'merchant1', isLocked: false });
      mockPrisma.merchantApiKey.findFirst.mockResolvedValue(null);
      mockPrisma.$transaction.mockResolvedValue([{ id: 'key1', createdAt: new Date() }]);
    });

    it('creates a new api key and returns raw key + id', async () => {
      const result = await service.createApiKey(merchantUser, 'merchant1', 'store1', 'My Key');
      expect(result.apiKey).toBeDefined();
      expect(result.apiKeyId).toBe('key1');
    });

    it('throws ForbiddenException when user is not the merchant', async () => {
      await expect(service.createApiKey(otherUser, 'merchant1', 'store1', 'My Key')).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when store not owned by merchant', async () => {
      mockPrisma.store.findFirst.mockResolvedValue(null);
      await expect(service.createApiKey(merchantUser, 'merchant1', 'store1', 'My Key')).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when store is locked', async () => {
      mockPrisma.store.findFirst.mockResolvedValue({ id: 'store1', merchantId: 'merchant1', isLocked: true });
      await expect(service.createApiKey(merchantUser, 'merchant1', 'store1', 'My Key')).rejects.toThrow(ForbiddenException);
    });

    it('throws ConflictException when an active key already exists for the store', async () => {
      mockPrisma.merchantApiKey.findFirst.mockResolvedValue({ id: 'existing-key' });
      await expect(service.createApiKey(merchantUser, 'merchant1', 'store1', 'My Key')).rejects.toThrow(ConflictException);
    });

    it('allows creating a key when previous key is revoked (revokedAt set)', async () => {
      // findFirst({ revokedAt: null }) returns null because revoked key is excluded
      mockPrisma.merchantApiKey.findFirst.mockResolvedValue(null);
      const result = await service.createApiKey(merchantUser, 'merchant1', 'store1', 'New Key');
      expect(result.apiKeyId).toBeDefined();
    });
  });

  describe('revokeApiKey', () => {
    beforeEach(() => {
      mockPrisma.merchantApiKey.findUnique.mockResolvedValue({ id: 'key1', merchantId: 'merchant1' });
      mockPrisma.merchantApiKey.update.mockResolvedValue({});
    });

    it('revokes an api key', async () => {
      await service.revokeApiKey('key1', merchantUser, 'merchant1');
      expect(mockPrisma.merchantApiKey.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'key1' }, data: expect.objectContaining({ revokedAt: expect.any(Date) }) }),
      );
    });

    it('throws ForbiddenException when user is not the merchant', async () => {
      await expect(service.revokeApiKey('key1', otherUser, 'merchant1')).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when key does not exist', async () => {
      mockPrisma.merchantApiKey.findUnique.mockResolvedValue(null);
      await expect(service.revokeApiKey('bad-key', merchantUser, 'merchant1')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when key belongs to another merchant', async () => {
      mockPrisma.merchantApiKey.findUnique.mockResolvedValue({ id: 'key1', merchantId: 'other-merchant' });
      await expect(service.revokeApiKey('key1', merchantUser, 'merchant1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('validateApiKey', () => {
    const validKey = 'a'.repeat(64);

    it('returns principal when key is valid', async () => {
      mockPrisma.merchantApiKey.findFirst.mockResolvedValue({
        id: 'key1',
        merchantId: 'merchant1',
        storeId: 'store1',
        revokedAt: null,
        expiresAt: null,
        store: { isLocked: false },
      });

      const result = await service.validateApiKey(validKey);
      expect(result.merchantId).toBe('merchant1');
      expect(result.storeId).toBe('store1');
    });

    it('throws UnauthorizedException when key not found', async () => {
      mockPrisma.merchantApiKey.findFirst.mockResolvedValue(null);
      await expect(service.validateApiKey(validKey)).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException when key is revoked', async () => {
      mockPrisma.merchantApiKey.findFirst.mockResolvedValue({
        id: 'key1',
        revokedAt: new Date(),
        store: { isLocked: false },
      });
      await expect(service.validateApiKey(validKey)).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when key is expired', async () => {
      mockPrisma.merchantApiKey.findFirst.mockResolvedValue({
        id: 'key1',
        revokedAt: null,
        expiresAt: new Date(Date.now() - 1000),
        store: { isLocked: false },
      });
      await expect(service.validateApiKey(validKey)).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when store is locked', async () => {
      mockPrisma.merchantApiKey.findFirst.mockResolvedValue({
        id: 'key1',
        revokedAt: null,
        expiresAt: null,
        store: { isLocked: true },
      });
      await expect(service.validateApiKey(validKey)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('listApiKeys', () => {
    it('returns all keys for the merchant', async () => {
      mockPrisma.merchantApiKey.findMany.mockResolvedValue([{ id: 'key1' }]);
      const result = await service.listApiKeys(merchantUser, 'merchant1');
      expect(result).toHaveLength(1);
    });

    it('throws ForbiddenException when user is not the merchant', async () => {
      await expect(service.listApiKeys(otherUser, 'merchant1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('getApiKey', () => {
    it('returns key when found and owned', async () => {
      mockPrisma.merchantApiKey.findUnique.mockResolvedValue({ id: 'key1', merchantId: 'merchant1', store: {} });
      const result = await service.getApiKey(merchantUser, 'merchant1', 'key1');
      expect(result.id).toBe('key1');
    });

    it('throws NotFoundException when key not found', async () => {
      mockPrisma.merchantApiKey.findUnique.mockResolvedValue(null);
      await expect(service.getApiKey(merchantUser, 'merchant1', 'bad')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when key belongs to another merchant', async () => {
      mockPrisma.merchantApiKey.findUnique.mockResolvedValue({ id: 'key1', merchantId: 'other' });
      await expect(service.getApiKey(merchantUser, 'merchant1', 'key1')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('updateApiKey', () => {
    beforeEach(() => {
      mockPrisma.merchantApiKey.findUnique.mockResolvedValue({ id: 'key1', merchantId: 'merchant1', revokedAt: null });
      mockPrisma.merchantApiKey.update.mockResolvedValue({ id: 'key1', name: 'New Name' });
    });

    it('updates name and returns updated key', async () => {
      const result = await service.updateApiKey(merchantUser, 'merchant1', 'key1', 'New Name');
      expect(result).toBeDefined();
    });

    it('throws ForbiddenException when key is revoked', async () => {
      mockPrisma.merchantApiKey.findUnique.mockResolvedValue({ id: 'key1', merchantId: 'merchant1', revokedAt: new Date() });
      await expect(service.updateApiKey(merchantUser, 'merchant1', 'key1', 'Name')).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when key does not exist', async () => {
      mockPrisma.merchantApiKey.findUnique.mockResolvedValue(null);
      await expect(service.updateApiKey(merchantUser, 'merchant1', 'key1', 'Name')).rejects.toThrow(NotFoundException);
    });
  });
});
