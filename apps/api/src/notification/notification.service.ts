import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuthenticatedUser } from '../auth/auth.types';
import { ExpoTokenDto } from './dto/expo-token.dto';
import { createApiError } from '../common/api-error';
import { AUTH_ERRORS } from '../auth/auth-errors';
import { NOTIFICATION_MESSAGES } from './notification.message';
import type { OrderType } from '@prisma/client';

type ExpoMessage = {
  to: string;
  title: string;
  body: string;
  data?: Record<string, string>;
};

type ExpoResponse = {
  data: Array<{ status: 'ok' | 'error'; message?: string }>;
};

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private readonly expoUrl = 'https://exp.host/--/expoapi/v2/push/send';

  constructor(private readonly prisma: PrismaService) { }

  async putExpoToken(user: AuthenticatedUser, dto: ExpoTokenDto) {
    const driver = await this.prisma.driver.findUnique({
      where: { userId: user.id },
    });

    if (!driver) {
      throw new NotFoundException(createApiError('DRIVER_NOT_FOUND', AUTH_ERRORS));
    }

    await this.prisma.driver.update({
      where: { userId: user.id },
      data: { expoPushToken: dto.token },
    });

    return { message: NOTIFICATION_MESSAGES.EXPO_TOKEN_UPDATED };
  }

  // Notify all drivers in proximity base on their delivery radius
  async notifyDrivers(
    tokens: string[],
    orderId: string,
    customerName: string,
    type: OrderType,
    storeAddress: string,
    reward: number,
    distanceKm: number,
  ): Promise<void> {
    if (tokens.length === 0) return; // If cant notify any driver, do nothing, order should be created anyway

    const messages: ExpoMessage[] = tokens.map((token) => ({
      to: token,
      title: 'New delivery available',
      body: `Pickup for ${customerName} near ${storeAddress} · ${distanceKm.toFixed(1)} km · ${reward}€`,
      data: {
        orderId,
        customerName,
        type,
        storeAddress,
        reward: String(reward),
        distanceKm: String(distanceKm),
      },
    }));

    try {
      const response = await fetch(this.expoUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(messages),
      },
      );
      if (!response.ok) {
        this.logger.error(`Expo push request failed: ${response.status}`);
      };

      const result = (await response.json()) as ExpoResponse;
      result.data.forEach((ticket, i) => {
        if (ticket.status === 'error') {
          this.logger.warn(`Push failed for token ${messages[i].to}: ${ticket.message}`);
        }
      });
    } catch (err) {
      this.logger.error('Failed to reach Expo push API', err);
    }
  }
}
