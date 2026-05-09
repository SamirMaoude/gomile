import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { OutboundWebhookService } from 'src/webhook/outbound-webhook.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

jest.spyOn(Logger.prototype, 'error').mockImplementation(() => {});
jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => {});

const mockPrisma = {
  order: { findUnique: jest.fn() },
};

describe('OutboundWebhookService', () => {
  let service: OutboundWebhookService;
  let fetchMock: jest.SpyInstance;

  beforeEach(async () => {
    jest.clearAllMocks();
    fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({ ok: true } as Response);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OutboundWebhookService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get(OutboundWebhookService);
  });

  afterEach(() => fetchMock.mockRestore());

  describe('fireOrderEvent', () => {
    const orderWithWebhook = {
      id: 'order1',
      orderReference: 'REF-001',
      store: { webhookUrl: 'https://merchant.com/webhook', webhookSecret: 'secret123' },
    };

    it('sends signed POST request when webhookUrl and webhookSecret are set', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(orderWithWebhook);

      await service.fireOrderEvent('order1', OrderStatus.DRIVER_ACCEPTED);

      expect(fetchMock).toHaveBeenCalledWith(
        'https://merchant.com/webhook',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ 'X-Gomile-Webhook-Secret': expect.stringContaining('sha256=') }),
        }),
      );
    });

    it('sends correct event name for DELIVERED status', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(orderWithWebhook);
      await service.fireOrderEvent('order1', OrderStatus.DELIVERED);
      const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
      expect(body.event).toBe('delivery.status_completed');
    });

    it('does nothing when webhookUrl is missing', async () => {
      mockPrisma.order.findUnique.mockResolvedValue({ id: 'order1', store: { webhookUrl: null, webhookSecret: null } });
      await service.fireOrderEvent('order1', OrderStatus.DELIVERED);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('does nothing when order not found', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(null);
      await service.fireOrderEvent('bad-id', OrderStatus.DELIVERED);
      expect(fetchMock).not.toHaveBeenCalled();
    });

    it('logs warn on non-ok response without throwing', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(orderWithWebhook);
      fetchMock.mockResolvedValue({ ok: false, status: 500 } as Response);
      await expect(service.fireOrderEvent('order1', OrderStatus.DELIVERED)).resolves.toBeUndefined();
      expect(Logger.prototype.warn).toHaveBeenCalled();
    });

    it('logs error when fetch throws without propagating', async () => {
      mockPrisma.order.findUnique.mockResolvedValue(orderWithWebhook);
      fetchMock.mockRejectedValue(new Error('Network error'));
      await expect(service.fireOrderEvent('order1', OrderStatus.DELIVERED)).resolves.toBeUndefined();
      expect(Logger.prototype.error).toHaveBeenCalled();
    });
  });
});
