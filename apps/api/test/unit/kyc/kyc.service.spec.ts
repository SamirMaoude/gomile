import { Test, TestingModule } from '@nestjs/testing';
import { KycService } from 'src/kyc/kyc.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { KycStatus } from '@prisma/client';

const mockPrisma = {
  driver: { findUnique: jest.fn() },
  kycSubmission: { update: jest.fn(), create: jest.fn() },
  driverDocument: { updateMany: jest.fn() },
  $transaction: jest.fn().mockImplementation((ops) =>
    Array.isArray(ops) ? Promise.all(ops) : ops(mockPrisma),
  ),
};

describe('KycService', () => {
  let service: KycService;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        KycService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get(KycService);
  });

  describe('submitKyc', () => {
    it('creates PENDING submission and updates driver status', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({
        userId: 'driver1',
        kycStatus: KycStatus.NOT_SUBMITTED,
        driverDocuments: [{ id: 'doc1' }],
      });
      mockPrisma.kycSubmission.create.mockResolvedValue({});
      mockPrisma.driver.update = jest.fn().mockResolvedValue({});

      const result = await service.submitKyc('driver1');
      expect(result.message).toBeDefined();
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('throws NotFoundException if driver does not exist', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(null);
      await expect(service.submitKyc('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('throws ConflictException if KYC already PENDING', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({
        userId: 'driver1',
        kycStatus: KycStatus.PENDING,
        driverDocuments: [{ id: 'doc1' }],
      });
      await expect(service.submitKyc('driver1')).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException if KYC already ACCEPTED', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({
        userId: 'driver1',
        kycStatus: KycStatus.ACCEPTED,
        driverDocuments: [{ id: 'doc1' }],
      });
      await expect(service.submitKyc('driver1')).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException if driver has no documents', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({
        userId: 'driver1',
        kycStatus: KycStatus.NOT_SUBMITTED,
        driverDocuments: [],
      });
      await expect(service.submitKyc('driver1')).rejects.toThrow(ConflictException);
    });
  });

  describe('approveDriverKyc', () => {
    const mockDriver = {
      userId: 'driver1',
      kycSubmissions: [{ id: 'sub1', status: KycStatus.PENDING }],
    };

    beforeEach(() => {
      mockPrisma.kycSubmission.update.mockResolvedValue({});
      mockPrisma.driver.update = jest.fn().mockResolvedValue({});
      mockPrisma.driverDocument.updateMany.mockResolvedValue({});
    });

    it('transitions submission and driver to ACCEPTED', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(mockDriver);

      const result = await service.approveDriverKyc('driver1');
      expect(result.message).toBeDefined();
      expect(mockPrisma.$transaction).toHaveBeenCalled();
    });

    it('throws NotFoundException if driver does not exist', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(null);
      await expect(service.approveDriverKyc('bad-id')).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException if no pending submission exists', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({
        userId: 'driver1',
        kycSubmissions: [],
      });
      await expect(service.approveDriverKyc('driver1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('rejectDriverKyc', () => {
    it('transitions submission and driver to REJECTED with reason', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({
        userId: 'driver1',
        kycSubmissions: [{ id: 'sub1', status: KycStatus.PENDING }],
      });
      mockPrisma.kycSubmission.update.mockResolvedValue({});
      mockPrisma.driver.update = jest.fn().mockResolvedValue({});

      const result = await service.rejectDriverKyc('driver1', 'Documents illisibles');
      expect(result.message).toBeDefined();
      expect(mockPrisma.kycSubmission.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: KycStatus.REJECTED,
            rejectionReason: 'Documents illisibles',
          }),
        }),
      );
    });

    it('throws NotFoundException if driver does not exist', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(null);
      await expect(service.rejectDriverKyc('bad-id', 'reason')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getMyKycStatus', () => {
    it('returns status, documents and latest submission', async () => {
      const mockDoc = { id: 'doc1', type: 'CNI', url: 'http://s3/doc1', verified: false, rejectionReason: null, createdAt: new Date() };
      const mockSub = { id: 'sub1', status: KycStatus.PENDING, rejectionReason: null, createdAt: new Date() };

      mockPrisma.driver.findUnique.mockResolvedValue({
        userId: 'driver1',
        kycStatus: KycStatus.PENDING,
        driverDocuments: [mockDoc],
        kycSubmissions: [mockSub],
      });

      const result = await service.getMyKycStatus('driver1');
      expect(result.status).toBe(KycStatus.PENDING);
      expect(result.documents).toHaveLength(1);
      expect(result.latestSubmission?.id).toBe('sub1');
    });

    it('returns null latestSubmission when no submissions exist', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({
        userId: 'driver1',
        kycStatus: KycStatus.NOT_SUBMITTED,
        driverDocuments: [],
        kycSubmissions: [],
      });

      const result = await service.getMyKycStatus('driver1');
      expect(result.latestSubmission).toBeNull();
    });

    it('throws NotFoundException if driver not found', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(null);
      await expect(service.getMyKycStatus('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
