import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from 'src/admin/admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';

const mockPrisma = {
  driver: { findMany: jest.fn(), findUnique: jest.fn() },
  walletEntry: { findMany: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  wallet: { update: jest.fn() },
  handshake: { updateMany: jest.fn() },
  $transaction: jest.fn().mockImplementation((ops) =>
    Array.isArray(ops) ? Promise.all(ops) : ops(mockPrisma),
  ),
};

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(AdminService);
  });

  describe('getAllDrivers', () => {
    it('returns all drivers', async () => {
      const drivers = [{ userId: 'd1', firstName: 'Jean' }, { userId: 'd2', firstName: 'Paul' }];
      mockPrisma.driver.findMany.mockResolvedValue(drivers);

      const result = await service.getAllDrivers();
      expect(result).toEqual(drivers);
      expect(mockPrisma.driver.findMany).toHaveBeenCalled();
    });

    it('returns empty array when no drivers exist', async () => {
      mockPrisma.driver.findMany.mockResolvedValue([]);
      const result = await service.getAllDrivers();
      expect(result).toEqual([]);
    });
  });

  describe('getDriver', () => {
    it('returns driver details when found', async () => {
      const driver = { userId: 'd1', firstName: 'Jean', wallet: { balance: 100 } };
      mockPrisma.driver.findUnique.mockResolvedValue(driver);

      const result = await service.getDriver('d1');
      expect(result).toEqual(driver);
    });

    it('throws NotFoundException when driver not found', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(null);
      await expect(service.getDriver('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getWithdrawals', () => {
    it('returns all withdrawals when no filters given', async () => {
      const entries = [{ id: 'e1', amount: 50, status: 'PENDING' }];
      mockPrisma.walletEntry.findMany.mockResolvedValue(entries);

      const result = await service.getWithdrawals();
      expect(result).toEqual(entries);
      expect(mockPrisma.walletEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ type: 'DEBIT' }) }),
      );
    });

    it('filters by status when provided', async () => {
      mockPrisma.walletEntry.findMany.mockResolvedValue([]);
      await service.getWithdrawals(undefined, 'PENDING');
      expect(mockPrisma.walletEntry.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ status: 'PENDING' }) }),
      );
    });
  });

  describe('updateWithdrawal', () => {
    const pendingEntry = { id: 'e1', walletId: 'w1', amount: 50, status: 'PENDING' };

    beforeEach(() => {
      mockPrisma.walletEntry.update.mockResolvedValue({});
      mockPrisma.wallet.update.mockResolvedValue({});
    });

    it('marks withdrawal as COMPLETED', async () => {
      mockPrisma.walletEntry.findUnique.mockResolvedValue(pendingEntry);

      const result = await service.updateWithdrawal('e1', 'COMPLETED');
      expect(result.message).toBeDefined();
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('cancels withdrawal and refunds balance to driver wallet', async () => {
      mockPrisma.walletEntry.findUnique.mockResolvedValue(pendingEntry);

      await service.updateWithdrawal('e1', 'CANCELLED');

      expect(mockPrisma.wallet.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'w1' },
          data: { balance: { increment: 50 } },
        }),
      );
    });

    it('does not refund wallet on COMPLETED', async () => {
      mockPrisma.walletEntry.findUnique.mockResolvedValue(pendingEntry);
      await service.updateWithdrawal('e1', 'COMPLETED');
      expect(mockPrisma.wallet.update).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when entry not found', async () => {
      mockPrisma.walletEntry.findUnique.mockResolvedValue(null);
      await expect(service.updateWithdrawal('bad-id', 'COMPLETED')).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException when entry is not PENDING', async () => {
      mockPrisma.walletEntry.findUnique.mockResolvedValue({ ...pendingEntry, status: 'COMPLETED' });
      await expect(service.updateWithdrawal('e1', 'CANCELLED')).rejects.toThrow(ConflictException);
    });
  });
});
