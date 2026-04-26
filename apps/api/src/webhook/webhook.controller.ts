import {
  Controller,
  Post,
  Headers,
  Body,
  UnauthorizedException,
  Logger,
  HttpCode,
  HttpStatus,
  RawBody
} from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';
import { spawn } from 'child_process';
import { resolve } from 'path';
import { SubscriptionService } from '../subscription/subscription.service';

@Controller('webhook')
export class WebhookController {
  constructor (
    private readonly logger: Logger,
    private readonly subscriptionService:  SubscriptionService
  ) {}

  // Deploy application, to be called by webhook
  @Post('deploy')
  deploy(@Headers('x-gitlab-token') token: string, @Body() body: any) {
    const secret = process.env.GITLAB_WEBHOOK_SECRET;
    if (!secret || token !== secret) {
      throw new UnauthorizedException();
    }

    const ref = body?.ref as string;
    if (ref !== 'refs/heads/dev') {
      return { message: 'ignored' };
    }

    // Resolve deploy.sh relative to compiled output: dist/webhook/ repo root
    const deployScript = resolve(__dirname, '../../../../infra/deploy.sh');

    const child = spawn('bash', [deployScript], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();

    this.logger.log(`Deploy triggered for ${ref}`);
    return { message: 'deploy started' };
  }
    
  // Not to be used ! this is Stripe's webhook
  @Post('subscription-events')
  @HttpCode(HttpStatus.OK)
  @ApiExcludeEndpoint()
  webhook(
    @RawBody() payload: Buffer,
    @Headers('stripe-signature') signature: string,
  ): Promise<void> {
    return this.subscriptionService.handleWebhook(payload, signature);
  }
}
