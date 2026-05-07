import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { OrderService } from 'src/order/merchants/order-merchants.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { OpenRouteService } from 'src/delivery/openrouteservice.service';
import { DeliveryPricingService } from 'src/delivery/delivery-pricing.service';
import { NotificationService } from 'src/notification/notification.service';
import { OutboundWebhookService } from 'src/webhook/outbound-webhook.service';
import { SmsService } from 'src/sms/sms.service';
import { ForbiddenException, ConflictException, NotFoundException } from '@nestjs/common';
import { Role, OrderStatus } from '@prisma/client';

jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});

const mockPrisma = {
  merchant: { findUnique: jest.fn() },
  store: { findUnique: jest.fn(), findFirst: jest.fn() },
  order: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
  },
  handshake: { findUnique: jest.fn(), findFirst: jest.fn() },
  $queryRaw: jest.fn().mockResolvedValue([]),
  $transaction: jest.fn().mockImplementation((ops) =>
    Array.isArray(ops) ? Promise.all(ops) : ops(mockPrisma),
  ),
};

const mockOrs = {
  geocodeAddress: jest.fn(),
  getDrivingRoute: jest.fn(),
};

const mockPricing = {
  calculate: jest.fn(),
};

const mockNotification = {
  notifyDrivers: jest.fn().mockResolvedValue(undefined),
};

const mockWebhook = {
  fireOrderEvent: jest.fn(),
};

const mockSms = {
  sendSms: jest.fn().mockResolvedValue(undefined),
};

const merchantUser = { id: 'merchant1', email: 'merchant@test.com', role: Role.MERCHANT };

describe('OrderService (merchants)', () => {
  let service: OrderService;

  beforeEach(async () => {
    jest.clearAllMocks();

    mockPrisma.merchant.findUnique.mockResolvedValue({ userId: 'merchant1' });
    const mockStore = { id: 'store1', merchantId: 'merchant1', latitude: 48.8566, longitude: 2.3522, address: '1 rue Test' };
    mockPrisma.store.findUnique.mockResolvedValue(mockStore);
    mockPrisma.store.findFirst.mockResolvedValue(mockStore);
    mockOrs.geocodeAddress.mockResolvedValue({ latitude: 48.87, longitude: 2.35 });
    mockOrs.getDrivingRoute.mockResolvedValue({ distanceMeters: 5000 });
    mockPricing.calculate.mockReturnValue({ deliveryFee: 4.5, reward: 3.15, distanceKm: 5 });
    mockPrisma.order.create.mockResolvedValue({
      id: 'order1',
      customerPhone: '+33600000001',
      status: OrderStatus.SEARCHING_DRIVER,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: OpenRouteService, useValue: mockOrs },
        { provide: DeliveryPricingService, useValue: mockPricing },
        { provide: NotificationService, useValue: mockNotification },
        { provide: OutboundWebhookService, useValue: mockWebhook },
        { provide: SmsService, useValue: mockSms },
      ],
    }).compile();

    service = module.get(OrderService);
  });

  describe('createOrder', () => {
    const dto = {
      customerName: 'Alice',
      customerPhone: '+33600000001',
      dropOffAddress: '2 rue Livraison, Paris',
      type: 'STANDARD' as any,
      packageSize: 'MEDIUM' as any,
      weight: 2,
      orderReference: 'REF001',
    };

    it('creates order and returns orderId, deliveryCode, deliveryFee', async () => {
      const result = await service.createOrder(merchantUser, 'store1', 'merchant1', dto);

      expect(mockPrisma.order.create).toHaveBeenCalled();
      expect(result.orderId).toBe('order1');
      expect(result.deliveryFee).toBe(4.5);
    });

    it('geocodes the drop-off address', async () => {
      await service.createOrder(merchantUser, 'store1', 'merchant1', dto);
      expect(mockOrs.geocodeAddress).toHaveBeenCalledWith(dto.dropOffAddress);
    });

    it('fires SMS to customerPhone after order creation (fire-and-forget)', async () => {
      await service.createOrder(merchantUser, 'store1', 'merchant1', dto);
      // Give the fire-and-forget a tick to run
      await new Promise((r) => setImmediate(r));
      expect(mockSms.sendSms).toHaveBeenCalledWith('+33600000001', expect.any(String));
    });

    it('does not fail if SMS throws', async () => {
      mockSms.sendSms.mockRejectedValue(new Error('Twilio down'));
      await expect(service.createOrder(merchantUser, 'store1', 'merchant1', dto)).resolves.toBeDefined();
    });

    it('throws ForbiddenException when merchant tries to create order for another merchant', async () => {
      const otherUser = { ...merchantUser, id: 'other-merchant' };
      await expect(service.createOrder(otherUser, 'store1', 'merchant1', dto)).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when merchant does not exist', async () => {
      mockPrisma.merchant.findUnique.mockResolvedValue(null);
      await expect(service.createOrder(merchantUser, 'store1', 'merchant1', dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelOrder', () => {
    const mockOrder = {
      id: 'order1',
      merchantId: 'merchant1',
      status: OrderStatus.SEARCHING_DRIVER,
    };

    beforeEach(() => {
      mockPrisma.order.findFirst.mockResolvedValue(mockOrder);
      mockPrisma.order.update.mockResolvedValue({ ...mockOrder, status: OrderStatus.CANCELLED });
    });

    it('cancels an order in SEARCHING_DRIVER status', async () => {
      const result = await service.cancelOrder(merchantUser, 'merchant1', 'order1');
      expect(result).toBeDefined();
      expect(mockPrisma.order.update).toHaveBeenCalled();
    });

    it('throws ForbiddenException when order not found (ownership check)', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);
      await expect(service.cancelOrder(merchantUser, 'merchant1', 'bad-id')).rejects.toThrow(ForbiddenException);
    });

    it('throws ConflictException when order is already delivered', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({ ...mockOrder, status: OrderStatus.DELIVERED });
      await expect(service.cancelOrder(merchantUser, 'merchant1', 'order1')).rejects.toThrow(ConflictException);
    });

    it('throws ConflictException when order is already cancelled', async () => {
      mockPrisma.order.findFirst.mockResolvedValue({ ...mockOrder, status: OrderStatus.CANCELLED });
      await expect(service.cancelOrder(merchantUser, 'merchant1', 'order1')).rejects.toThrow(ConflictException);
    });
  });

  describe('getOrder', () => {
    it('returns order when found and owned by merchant', async () => {
      const mockOrder = { id: 'order1', merchantId: 'merchant1', status: OrderStatus.SEARCHING_DRIVER };
      mockPrisma.order.findFirst.mockResolvedValue(mockOrder);

      const result = await service.getOrder(merchantUser, 'merchant1', 'order1');
      expect(result).toMatchObject({ status: OrderStatus.SEARCHING_DRIVER });
    });

    it('throws ForbiddenException when order not found', async () => {
      mockPrisma.order.findFirst.mockResolvedValue(null);
      await expect(service.getOrder(merchantUser, 'merchant1', 'bad-id')).rejects.toThrow(ForbiddenException);
    });
  });
});
