import { Injectable, Logger } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client = new SNSClient({ region: process.env.AWS_REGION });

  async sendSms(phone: string, message: string): Promise<void> {
    try {
      await this.client.send(new PublishCommand({ PhoneNumber: phone, Message: message }));
    } catch (err) {
      this.logger.error(`SMS failed to ${phone}`, err);
    }
  }
}
