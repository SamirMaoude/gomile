import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { NotFoundException } from '@nestjs/common';
import { NotificationService } from 'src/notification/notification.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Role } from '@prisma/client';

jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'log').mockImplementation(() => {});

const mockPrisma = {
  driver: {
    findUnique: jest.fn(),
    update: jest.fn(),
  },
};

const driverUser = { id: 'driver1', email: 'driver@test.com', role: Role.DRIVER };

describe('NotificationService', () => {
  let service: NotificationService;
  let fetchMock: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => ({ data: [{ status: 'ok' }] }),
    } as Response);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(NotificationService);
  });

  afterEach(() => {
    fetchMock.mockRestore();
  });

  describe('putExpoToken', () => {
    it('saves expo token and returns message', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue({ userId: 'driver1' });
      mockPrisma.driver.update.mockResolvedValue({});

      const result = await service.putExpoToken(driverUser, { token: 'ExponentPushToken[xxx]' });
      expect(result).toHaveProperty('message');
      expect(mockPrisma.driver.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { expoPushToken: 'ExponentPushToken[xxx]' } }),
      );
    });

    it('throws NotFoundException when driver does not exist', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(null);
      await expect(service.putExpoToken(driverUser, { token: 'token' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('notifyDrivers', () => {
    it('does nothing when tokens array is empty', async () => {
      await service.notifyDrivers([], 'order1', 'Alice', 'FOOD' as any, 'Paris', 5, 2.5);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('sends push notifications to expo API', async () => {
      await service.notifyDrivers(
        ['ExponentPushToken[abc]'],
        'order1',
        'Alice',
        'FOOD' as any,
        'Paris',
        5,
        2.5,
      );
      expect(fetchMock).toHaveBeenCalledWith(
        expect.stringContaining('expo'),
        expect.objectContaining({ method: 'POST' }),
      );
    });

    it('logs warn when expo returns error ticket', async () => {
      fetchMock.mockResolvedValue({
        ok: true,
        json: async () => ({ data: [{ status: 'error', message: 'DeviceNotRegistered' }] }),
      } as Response);

      await service.notifyDrivers(['bad-token'], 'order1', 'Alice', 'FOOD' as any, 'Paris', 5, 2.5);
      expect(Logger.prototype.warn).toHaveBeenCalled();
    });

    it('does not throw when expo API is unreachable', async () => {
      fetchMock.mockRejectedValue(new Error('Network error'));
      await expect(
        service.notifyDrivers(['token'], 'order1', 'Alice', 'FOOD' as any, 'Paris', 5, 2.5),
      ).resolves.toBeUndefined();
    });

    it('logs error on non-ok response', async () => {
      fetchMock.mockResolvedValue({ ok: false, status: 500, json: async () => ({ data: [] }) } as Response);
      await service.notifyDrivers(['token'], 'order1', 'Alice', 'FOOD' as any, 'Paris', 5, 2.5);
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });
});
