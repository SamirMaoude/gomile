import { Injectable, Logger } from '@nestjs/common';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

  private normalizePhone(phone: string): string {
    const cleaned = phone.replace(/\s+/g, '');
    if (cleaned.startsWith('+')) return cleaned;
    if (cleaned.startsWith('0') && cleaned.length === 10) return `+33${cleaned.slice(1)}`;
    return cleaned;
  }

  async sendSms(phone: string, message: string): Promise<void> {
    const normalized = this.normalizePhone(phone);
    try {
      await this.client.messages.create({
        to: normalized,
        from: process.env.TWILIO_PHONE_NUMBER,
        body: message,
      });
    } catch (err) {
      this.logger.error(`SMS failed to ${normalized}`, err);
      throw err;
    }
  }
}
