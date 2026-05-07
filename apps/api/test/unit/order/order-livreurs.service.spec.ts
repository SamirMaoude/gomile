import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { OrderLivreursService } from 'src/order/livreurs/order-livreurs.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SmsService } from 'src/sms/sms.service';
import { OutboundWebhookService } from 'src/webhook/outbound-webhook.service';
import {
  ConflictException,
  ForbiddenException,
  GoneException,
  UnauthorizedException,
} from '@nestjs/common';
import { HandshakeType, OrderStatus, Role } from '@prisma/client';

const mockPrisma = {
  driver: { findUnique: jest.fn(), update: jest.fn() },
  order: { findUnique: jest.fn(), update: jest.fn(), updateMany: jest.fn(), findMany: jest.fn() },
  handshake: { findUnique: jest.fn(), update: jest.fn() },
  wallet: { findUnique: jest.fn(), update: jest.fn() },
  walletEntry: { create: jest.fn() },
  $transaction: jest.fn().mockImplementation((ops) =>
    Array.isArray(ops) ? Promise.all(ops) : ops(mockPrisma),
  ),
};

const mockSms = { sendSms: jest.fn().mockResolvedValue(undefined) };
const mockWebhook = { fireOrderEvent: jest.fn() };
const mockLogger = { log: jest.fn(), error: jest.fn(), warn: jest.fn() };

const driverUser = { id: 'driver1', email: 'driver@test.com', role: Role.DRIVER };

describe('OrderLivreursService', () => {
  let service: OrderLivreursService;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockPrisma.driver.findUnique.mockResolvedValue({ userId: 'driver1', firstName: 'Jean' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderLivreursService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: SmsService, useValue: mockSms },
        { provide: OutboundWebhookService, useValue: mockWebhook },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    service = module.get(OrderLivreursService);
  });

  describe('acceptOrder', () => {
    const mockOrder = {
      id: 'order1',
      status: OrderStatus.SEARCHING_DRIVER,
      driverId: null,
      customerPhone: '+33600000001',
    };
    const mockHandshake = { id: 'hs1', code: '123456' };

    beforeEach(() => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.order.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.handshake.findUnique.mockResolvedValue(mockHandshake);
    });

    it('assigns driver and returns pickup code', async () => {
      const result = await service.acceptOrder(driverUser, 'driver1', 'order1');
      expect(result.pickupCode).toBe('123456');
      expect(mockPrisma.order.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ id: 'order1', status: OrderStatus.SEARCHING_DRIVER }),
          data: expect.objectContaining({ driverId: 'driver1', status: OrderStatus.DRIVER_ACCEPTED }),
        }),
      );
    });

    it('throws ForbiddenException when driver IDs do not match', async () => {
      const otherUser = { ...driverUser, id: 'other-driver' };
      await expect(service.acceptOrder(otherUser, 'driver1', 'order1')).rejects.toThrow(ForbiddenException);
    });

    it('throws ConflictException when order already taken', async () => {
      mockPrisma.order.updateMany.mockResolvedValue({ count: 0 });
      await expect(service.acceptOrder(driverUser, 'driver1', 'order1')).rejects.toThrow(ConflictException);
    });

    it('throws NotFoundException when driver does not exist', async () => {
      mockPrisma.driver.findUnique.mockResolvedValue(null);
      await expect(service.acceptOrder(driverUser, 'driver1', 'order1')).rejects.toThrow();
    });
  });

  describe('pickupOrder', () => {
    const future = new Date(Date.now() + 3600000);
    const past = new Date(Date.now() - 1000);

    const pickupHandshake = { id: 'hs1', code: 'PICKUP', remainingAttemps: 3, expiresAt: future };
    const deliveryHandshake = { id: 'hs2', code: 'DELIVER', remainingAttemps: 3, expiresAt: future };

    const mockOrder = {
      id: 'order1',
      status: OrderStatus.DRIVER_ACCEPTED,
      driverId: 'driver1',
      customerPhone: '+33600000001',
    };

    beforeEach(() => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      // Route calls by handshake type so individual tests can override cleanly
      mockPrisma.handshake.findUnique.mockImplementation(({ where }) => {
        const type = where?.orderId_type?.type;
        if (type === HandshakeType.A) return Promise.resolve(pickupHandshake);
        if (type === HandshakeType.B) return Promise.resolve(deliveryHandshake);
        return Promise.resolve(null);
      });
      mockPrisma.handshake.update.mockResolvedValue({});
      mockPrisma.order.update.mockResolvedValue({ ...mockOrder, status: OrderStatus.PICKED_UP });
    });

    it('verifies pickup code and transitions order to PICKED_UP', async () => {
      const result = await service.pickupOrder(driverUser, 'driver1', 'order1', 'PICKUP');
      expect(result.message).toBeDefined();
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: OrderStatus.PICKED_UP }),
        }),
      );
    });

    it('throws UnauthorizedException and decrements attempts on wrong code', async () => {
      await expect(service.pickupOrder(driverUser, 'driver1', 'order1', 'WRONG')).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.handshake.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { remainingAttemps: 2 } }),
      );
    });

    it('throws GoneException when handshake expired', async () => {
      mockPrisma.handshake.findUnique.mockImplementation(({ where }) => {
        const type = where?.orderId_type?.type;
        if (type === HandshakeType.A) return Promise.resolve({ ...pickupHandshake, expiresAt: past });
        return Promise.resolve(deliveryHandshake);
      });
      await expect(service.pickupOrder(driverUser, 'driver1', 'order1', 'PICKUP')).rejects.toThrow(GoneException);
    });

    it('throws 429 when no attempts remaining', async () => {
      mockPrisma.handshake.findUnique.mockImplementation(({ where }) => {
        const type = where?.orderId_type?.type;
        if (type === HandshakeType.A) return Promise.resolve({ ...pickupHandshake, remainingAttemps: 0 });
        return Promise.resolve(deliveryHandshake);
      });
      await expect(service.pickupOrder(driverUser, 'driver1', 'order1', 'PICKUP')).rejects.toThrow();
    });

    it('throws ConflictException if order already cancelled', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: OrderStatus.CANCELLED });
      await expect(service.pickupOrder(driverUser, 'driver1', 'order1', 'PICKUP')).rejects.toThrow(ConflictException);
    });

    it('throws ForbiddenException when driver does not own the order', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ ...mockOrder, driverId: 'other-driver' });
      await expect(service.pickupOrder(driverUser, 'driver1', 'order1', 'PICKUP')).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deliverOrder', () => {
    const future = new Date(Date.now() + 3600000);
    const past = new Date(Date.now() - 1000);

    const deliveryHandshake = { id: 'hs2', code: 'DELIVER', remainingAttemps: 3, expiresAt: future };
    const mockOrder = {
      id: 'order1',
      status: OrderStatus.PICKED_UP,
      driverId: 'driver1',
      customerPhone: '+33600000001',
      reward: 3.15,
    };
    const mockWallet = { id: 'w1', driverId: 'driver1' };

    beforeEach(() => {
      mockPrisma.order.findUnique.mockResolvedValue(mockOrder);
      mockPrisma.handshake.findUnique.mockResolvedValue(deliveryHandshake);
      mockPrisma.handshake.update.mockResolvedValue({});
      mockPrisma.order.update.mockResolvedValue({ ...mockOrder, status: OrderStatus.DELIVERED, reward: 3.15 });
      mockPrisma.wallet.findUnique.mockResolvedValue(mockWallet);
      mockPrisma.wallet.update.mockResolvedValue({});
      mockPrisma.walletEntry.create.mockResolvedValue({});
      mockPrisma.driver.update.mockResolvedValue({});
    });

    it('verifies delivery code and marks order as DELIVERED', async () => {
      const result = await service.deliverOrder(driverUser, 'driver1', 'order1', 'DELIVER');
      expect(result.message).toBeDefined();
      expect(mockPrisma.order.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: OrderStatus.DELIVERED }),
        }),
      );
    });

    it('credits driver wallet with reward', async () => {
      await service.deliverOrder(driverUser, 'driver1', 'order1', 'DELIVER');
      expect(mockPrisma.$transaction).toHaveBeenCalled();
      expect(mockPrisma.wallet.findUnique).toHaveBeenCalledWith({ where: { driverId: 'driver1' } });
    });

    it('increments driver totalTrips on delivery', async () => {
      await service.deliverOrder(driverUser, 'driver1', 'order1', 'DELIVER');
      expect(mockPrisma.driver.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ totalTrips: { increment: 1 } }),
        }),
      );
    });

    it('throws UnauthorizedException and decrements attempts on wrong code', async () => {
      await expect(service.deliverOrder(driverUser, 'driver1', 'order1', 'WRONG')).rejects.toThrow(UnauthorizedException);
      expect(mockPrisma.handshake.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: { remainingAttemps: 2 } }),
      );
    });

    it('throws ConflictException if already delivered', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ ...mockOrder, status: OrderStatus.DELIVERED });
      await expect(service.deliverOrder(driverUser, 'driver1', 'order1', 'DELIVER')).rejects.toThrow(ConflictException);
    });

    it('throws GoneException when handshake expired', async () => {
      mockPrisma.handshake.findUnique.mockResolvedValue({ ...deliveryHandshake, expiresAt: past });
      await expect(service.deliverOrder(driverUser, 'driver1', 'order1', 'DELIVER')).rejects.toThrow(GoneException);
    });

    it('throws ForbiddenException when driver does not match', async () => {
      const other = { ...driverUser, id: 'other' };
      await expect(service.deliverOrder(other, 'driver1', 'order1', 'DELIVER')).rejects.toThrow(ForbiddenException);
    });
  });
});
