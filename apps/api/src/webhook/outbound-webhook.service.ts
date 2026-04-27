import { Injectable, Logger } from '@nestjs/common';
import { createHmac } from 'crypto';
import { OrderStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const EVENT_NAME: Partial<Record<OrderStatus, string>> = {
  [OrderStatus.DRIVER_ACCEPTED]: 'delivery.status_changed',
  [OrderStatus.PICKED_UP]: 'delivery.status_changed',
  [OrderStatus.DELIVERED]: 'delivery.status_changed',
  [OrderStatus.CANCELLED]: 'delivery.status_completed',
};

@Injectable()
export class OutboundWebhookService {
  private readonly logger = new Logger(OutboundWebhookService.name);

  constructor(private readonly prisma: PrismaService) {}

  // Fires a webhook event for the given order and status
  async fireOrderEvent(orderId: string, status: OrderStatus): Promise<void> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        orderReference: true,
        store: {
          select: {
            webhookUrl: true,
            webhookSecret: true,
          },
        },
      },
    });

    const webhookUrl = order?.store?.webhookUrl;
    const webhookSecret = order?.store?.webhookSecret;

    if (!webhookUrl || !webhookSecret) return;

    const payload = {
      event: EVENT_NAME[status],
      orderId: order.id,
      orderReference: order.orderReference ?? null,
      status,
      timestamp: new Date().toISOString(),
    };

    const body = JSON.stringify(payload);
    const signature = createHmac('sha256', webhookSecret).update(body).digest('hex');

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Gomile-Webhook-Secret': `sha256=${signature}`,
        },
        body,
      });

      if (!response.ok) {
        this.logger.warn(`Webhook delivery failed for order ${orderId}: ${response.status}`);
      }
    } catch (err) {
      this.logger.error(`Webhook unreachable for order ${orderId}`, err);
    }
  }
}
