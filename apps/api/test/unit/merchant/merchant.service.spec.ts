import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException, ConflictException } from '@nestjs/common';
import { MerchantService } from 'src/merchant/merchant.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role, OrderStatus } from '@prisma/client';

const mockPrisma = {
  merchant: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  },
  order: {
    findFirst: jest.fn(),
  },
  $transaction: jest.fn().mockImplementation((ops) =>
    Array.isArray(ops) ? Promise.all(ops) : ops(mockPrisma),
  ),
};

const merchantUser = { id: 'merchant1', email: 'merchant@test.com', role: Role.MERCHANT };
const otherUser = { id: 'other', email: 'other@test.com', role: Role.MERCHANT };

describe('MerchantService', () => {
  let service: MerchantService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MerchantService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(MerchantService);
  });

  describe('getMerchant', () => {
    it('returns merchant profile', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue({
        name: 'Shop',
        createdAt: new Date(),
        user: { email: 'merchant@test.com', phone: '+33600000001' },
        subscription: 'FREE',
      });

      const result = await service.getMerchant(merchantUser, 'merchant1');
      expect(result.name).toBe('Shop');
      expect(result.email).toBe('merchant@test.com');
    });

    it('throws ForbiddenException when user is not the merchant', async () => {
      await expect(service.getMerchant(otherUser, 'merchant1')).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when merchant does not exist', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue(null);
      await expect(service.getMerchant(merchantUser, 'merchant1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateMerchant', () => {
    beforeEach(() => {
      mockPrisma.merchant.findUnique.mockResolvedValue({ userId: 'merchant1', name: 'Shop' });
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.$transaction.mockResolvedValue([]);
    });

    it('updates merchant name', async () => {
      const result = await service.updateMerchant(merchantUser, 'merchant1', { name: 'New Name' });
      expect(result.name).toBe('New Name');
    });

    it('throws ForbiddenException when user is not the merchant', async () => {
      await expect(service.updateMerchant(otherUser, 'merchant1', { name: 'X' })).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when merchant not found', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue(null);
      await expect(service.updateMerchant(merchantUser, 'merchant1', { name: 'X' })).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when phone is already in use by another account', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'different-user' });
      await expect(
        service.updateMerchant(merchantUser, 'merchant1', { phone: '+33600000002' }),
      ).rejects.toThrow(ConflictException);
    });

    it('allows updating phone if the existing record is the same user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'merchant1' });
      const result = await service.updateMerchant(merchantUser, 'merchant1', { phone: '+33600000003' });
      expect(result.phone).toBe('+33600000003');
    });
  });

  describe('deleteMerchant', () => {
    beforeEach(() => {
      mockPrisma.merchant.findUnique.mockResolvedValue({ userId: 'merchant1' });
      mockPrisma.order.findFirst.mockResolvedValue(null);
      mockPrisma.user.delete.mockResolvedValue({});
    });

    it('deletes merchant when no ongoing orders', async () => {
      await service.deleteMerchant(merchantUser, 'merchant1');
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: 'merchant1' } });
    });

    it('throws ForbiddenException when user is not the merchant', async () => {
      await expect(service.deleteMerchant(otherUser, 'merchant1')).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when merchant does not exist', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue(null);
      await expect(service.deleteMerchant(merchantUser, 'merchant1')).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when merchant has ongoing orders', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({ id: 'order1', status: OrderStatus.PICKED_UP });
      await expect(service.deleteMerchant(merchantUser, 'merchant1')).rejects.toThrow(ConflictException);
    });
  });
});
