import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { DriverMeService } from 'src/driver/driver-me.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { UploadService } from 'src/upload/upload.service';
import { EventsGateway } from 'src/events/events.gateway';
import { DriverStatus, OrderStatus, KycStatus } from '@prisma/client';
import { Role } from '@prisma/client';

jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

const mockPrisma = {
  driver: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  order: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
  },
  driverOrderRejection: {
    upsert: jest.fn(),
  },
  $queryRaw: jest.fn(),
  $executeRaw: jest.fn(),
};

const mockUpload = {
  presignPutObject: jest.fn(),
  deleteObject: jest.fn(),
};

const mockEventsGateway = {
  emitDriverStatus: jest.fn(),
};

const mockUser = { id: 'driver1', email: 'driver@test.com', role: Role.DRIVER };

describe('DriverMeService', () => {
  let service: DriverMeService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DriverMeService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: UploadService, useValue: mockUpload },
        { provide: EventsGateway, useValue: mockEventsGateway },
      ],
    }).compile();

    service = module.get(DriverMeService);
  });

  describe('existsDriver', () => {
    it('returns driver when found', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({ userId: 'driver1' });
      const result = await service.existsDriver(mockUser);
      expect(result).toEqual({ userId: 'driver1' });
    });

    it('throws NotFoundException when driver not found', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(null);
      await expect(service.existsDriver(mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleDriverAvailability', () => {
    it('toggles from AVAILABLE to OFFLINE and emits event', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({ userId: 'driver1', status: DriverStatus.AVAILABLE });
      mockPrisma.driver.update.mockResolvedValue({});

      const result = await service.toggleDriverAvailability(mockUser);

      expect(result.status).toBe(DriverStatus.OFFLINE);
      expect(mockEventsGateway.emitDriverStatus).toHaveBeenCalledWith('driver1', DriverStatus.OFFLINE);
    });

    it('toggles from OFFLINE to AVAILABLE and emits event', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({ userId: 'driver1', status: DriverStatus.OFFLINE });
      mockPrisma.driver.update.mockResolvedValue({});

      const result = await service.toggleDriverAvailability(mockUser);

      expect(result.status).toBe(DriverStatus.AVAILABLE);
      expect(mockEventsGateway.emitDriverStatus).toHaveBeenCalledWith('driver1', DriverStatus.AVAILABLE);
    });

    it('throws ConflictException when driver is BUSY', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({ userId: 'driver1', status: DriverStatus.BUSY });
      await expect(service.toggleDriverAvailability(mockUser)).rejects.toThrow(ConflictException);
    });
  });

  describe('rejectOrder', () => {
    it('creates rejection and returns message', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'order1' });
      mockPrisma.driverOrderRejection.upsert.mockResolvedValue({});

      const result = await service.rejectOrder(mockUser, 'order1');

      expect(mockPrisma.driverOrderRejection.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { driverId_orderId: { driverId: 'driver1', orderId: 'order1' } },
          create: { driverId: 'driver1', orderId: 'order1' },
        }),
      );
      expect(result).toHaveProperty('message');
    });

    it('is idempotent — upsert called even if rejection exists', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'order1' });
      mockPrisma.driverOrderRejection.upsert.mockResolvedValue({});

      await service.rejectOrder(mockUser, 'order1');
      await service.rejectOrder(mockUser, 'order1');

      expect(mockPrisma.driverOrderRejection.upsert).toHaveBeenCalledTimes(2);
    });

    it('throws NotFoundException when order does not exist', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await expect(service.rejectOrder(mockUser, 'bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getActiveOrders', () => {
    it('returns active orders flattening store name', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({ userId: 'driver1' });
      mockPrisma.order.findMany.mockResolvedValue([
        { id: 'order1', status: OrderStatus.DRIVER_ACCEPTED, store: { name: 'Boutique' } },
      ]);

      const result = await service.getActiveOrders(mockUser);

      expect(result[0].store).toBe('Boutique');
    });

    it('returns empty array when no active orders', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({ userId: 'driver1' });
      mockPrisma.order.findMany.mockResolvedValue([]);

      const result = await service.getActiveOrders(mockUser);
      expect(result).toHaveLength(0);
    });
  });

  describe('getPastOrders', () => {
    it('returns past delivered orders', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({ userId: 'driver1' });
      mockPrisma.order.findMany.mockResolvedValue([
        { id: 'order1', status: OrderStatus.DELIVERED, store: { name: 'Shop' } },
      ]);

      const result = await service.getPastOrders(mockUser);
      expect(result[0].store).toBe('Shop');
    });
  });

  describe('getDriverProfile', () => {
    it('returns driver profile with kycStatus and documents', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({
        userId: 'driver1',
        firstName: 'Jean',
        lastName: 'Dupont',
        avatarUrl: null,
        rating: 4.9,
        totalTrips: 10,
        activeVehicle: null,
        gomileCode: 'GM-ABC',
        status: DriverStatus.AVAILABLE,
        kycStatus: KycStatus.ACCEPTED,
        user: { email: 'driver@test.com', phone: '+33600000001' },
        driverDocuments: [],
      });

      const result = await service.getDriverProfile(mockUser);

      expect(result.kycStatus).toBe(KycStatus.ACCEPTED);
      expect(result.documents).toEqual([]);
      expect(result.firstName).toBe('Jean');
    });

    it('throws NotFoundException when driver not found', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(null);
      await expect(service.getDriverProfile(mockUser)).rejects.toThrow(NotFoundException);
    });
  });
});
