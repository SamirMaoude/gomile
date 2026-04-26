import { ApiProperty } from '@nestjs/swagger';

export class ConfigureWebhookResponseDto {
  @ApiProperty({ example: 'https://myshop.com/webhooks/gomile' })
  webhookUrl: string;

  @ApiProperty({
    description: 'Signing secret. Shown once — store it securely. Use it to verify the X-Gomile-Webhook-Secret header on incoming events.',
    example: 'a3f2c1...',
  })
  webhookSecret: string;
}
