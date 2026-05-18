import { Test, TestingModule } from '@nestjs/testing';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { WebhookController } from 'src/webhook/webhook.controller';
import { SubscriptionService } from 'src/subscription/subscription.service';

const mockSubscriptionService = {
  handleWebhook: jest.fn(),
};

describe('WebhookController', () => {
  let controller: WebhookController;
  const originalEnv = process.env;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env = { ...originalEnv, GITLAB_WEBHOOK_SECRET: 'secret123' };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WebhookController],
      providers: [
        Logger,
        { provide: SubscriptionService, useValue: mockSubscriptionService },
      ],
    }).compile();
    controller = module.get(WebhookController);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('deploy', () => {
    it('throws UnauthorizedException when token is wrong', () => {
      expect(() => controller.deploy('wrong-token', {})).toThrow(UnauthorizedException);
    });

    it('returns ignored when ref is not dev branch', () => {
      const result = controller.deploy('secret123', { ref: 'refs/heads/main' });
      expect(result).toEqual({ message: 'ignored' });
    });

    it('starts deploy when ref is dev branch', () => {
      const result = controller.deploy('secret123', { ref: 'refs/heads/dev' });
      expect(result).toEqual({ message: 'deploy started' });
    });
  });

  describe('webhook (Stripe)', () => {
    it('delegates to subscriptionService.handleWebhook', async () => {
      mockSubscriptionService.handleWebhook.mockResolvedValue(undefined);
      const payload = Buffer.from('{}');
      await controller.webhook(payload, 'stripe-sig');
      expect(mockSubscriptionService.handleWebhook).toHaveBeenCalledWith(payload, 'stripe-sig');
    });
  });
});
