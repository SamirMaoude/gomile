import { Injectable, Logger } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client = new SNSClient({ region: process.env.AWS_REGION });

  // SNS only accepts numbers following a strict format
  private normalizePhone(phone: string): string {
    const cleaned = phone.replace(/\s+/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.startsWith('0') && cleaned.length === 10) return `+33${cleaned.slice(1)}`;
    return cleaned;
  }

  async sendSms(phone: string, message: string): Promise<void> {
    const normalized = this.normalizePhone(phone);
    let response : any;
    try {
      response = await this.client.send(new PublishCommand({
        PhoneNumber: normalized,
        Message: message,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': { DataType: 'String', StringValue: 'Transactional' },
        },
      }));
    } catch (err) {
      this.logger.error(`SMS failed to ${normalized}`, err);
      throw err;
    }
    return response;
  }
}
