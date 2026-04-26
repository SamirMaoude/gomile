import { ApiProperty } from '@nestjs/swagger';
import { IsUrl } from 'class-validator';

export class ConfigureWebhookDto {
  @ApiProperty({
    description: 'Webhook URL where order status events will be delivered',
    example: 'https://myshop.com/webhooks/gomile',
  })
  @IsUrl()
  webhookUrl: string;
}
