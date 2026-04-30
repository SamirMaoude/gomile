import { Injectable, Logger } from '@nestjs/common';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly client = new SNSClient({ region: process.env.AWS_REGION });

  async sendSms(phone: string, message: string): Promise<void> {
    let response: any;
    try {
        response = await this.client.send(new PublishCommand({ 
        PhoneNumber: phone, 
        Message: message,
        MessageAttributes: {
          'AWS.SNS.SMS.SMSType': {
            DataType: 'String',
            StringValue: 'Transactional',
          },
      }}));
      } catch (err) {
      console.error(`Failed to send SMS to ${phone}:`, err);
      this.logger.error(`SMS failed to ${phone}`, err);
    }
    return response;
  }
}
