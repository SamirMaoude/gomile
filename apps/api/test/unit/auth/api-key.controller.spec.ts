import { Test, TestingModule } from '@nestjs/testing';
import { ApiKeyController } from 'src/auth/api-key.controller';
import { ApiKeyService } from 'src/auth/api-key.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from 'src/auth/guards/email-verified.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

const allowAll = { canActivate: () => true };

const mockApiKeyService = {
  createApiKey: jest.fn(),
  listApiKeys: jest.fn(),
  getApiKey: jest.fn(),
  updateApiKey: jest.fn(),
  revokeApiKey: jest.fn(),
};

const user = { id: 'm1', role: 'MERCHANT' } as any;

describe('ApiKeyController', () => {
  let controller: ApiKeyController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiKeyController],
      providers: [{ provide: ApiKeyService, useValue: mockApiKeyService }],
    })
      .overrideGuard(JwtAuthGuard).useValue(allowAll)
      .overrideGuard(EmailVerifiedGuard).useValue(allowAll)
      .overrideGuard(RolesGuard).useValue(allowAll)
      .compile();
    controller = module.get(ApiKeyController);
  });

  it('createApiKey builds response from service result', async () => {
    const now = new Date();
    mockApiKeyService.createApiKey.mockResolvedValue({
      apiKeyId: 'k1',
      apiKey: 'secret',
      createdAt: now,
    });
    const dto = { storeId: 's1', name: 'My Key', expiresAt: undefined } as any;
    const result = await controller.createApiKey('m1', user, dto);
    expect(mockApiKeyService.createApiKey).toHaveBeenCalledWith(user, 'm1', 's1', 'My Key', undefined);
    expect(result.id).toBe('k1');
    expect(result.apiKey).toBe('secret');
  });

  it('listApiKeys delegates to service', async () => {
    mockApiKeyService.listApiKeys.mockResolvedValue([]);
    await controller.listApiKeys('m1', user);
    expect(mockApiKeyService.listApiKeys).toHaveBeenCalledWith(user, 'm1');
  });

  it('getApiKey delegates to service', async () => {
    mockApiKeyService.getApiKey.mockResolvedValue({ id: 'k1' });
    await controller.getApiKey('m1', 'k1', user);
    expect(mockApiKeyService.getApiKey).toHaveBeenCalledWith(user, 'm1', 'k1');
  });

  it('updateApiKey delegates to service', async () => {
    mockApiKeyService.updateApiKey.mockResolvedValue({ id: 'k1' });
    const dto = { name: 'New Name', expiresAt: undefined } as any;
    await controller.updateApiKey('m1', 'k1', user, dto);
    expect(mockApiKeyService.updateApiKey).toHaveBeenCalledWith(user, 'm1', 'k1', 'New Name', undefined);
  });

  it('revokeApiKey delegates to service', async () => {
    mockApiKeyService.revokeApiKey.mockResolvedValue(undefined);
    await controller.revokeApiKey('m1', 'k1', user);
    expect(mockApiKeyService.revokeApiKey).toHaveBeenCalledWith('k1', user, 'm1');
  });
});
