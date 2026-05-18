import { Test, TestingModule } from '@nestjs/testing';
import { StoreController } from 'src/store/store.controller';
import { StoreService } from 'src/store/store.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from 'src/auth/guards/email-verified.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

const allowAll = { canActivate: () => true };

const mockStoreService = {
  createStore: jest.fn(),
  updateStore: jest.fn(),
  disableStore: jest.fn(),
  enableStore: jest.fn(),
  deleteStore: jest.fn(),
  listStore: jest.fn(),
  configureWebhook: jest.fn(),
  getStore: jest.fn(),
};

const user = { id: 'm1', role: 'MERCHANT' } as any;

describe('StoreController', () => {
  let controller: StoreController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StoreController],
      providers: [{ provide: StoreService, useValue: mockStoreService }],
    })
      .overrideGuard(JwtAuthGuard).useValue(allowAll)
      .overrideGuard(EmailVerifiedGuard).useValue(allowAll)
      .overrideGuard(RolesGuard).useValue(allowAll)
      .compile();
    controller = module.get(StoreController);
  });

  it('createStore delegates to storeService', async () => {
    mockStoreService.createStore.mockResolvedValue({ id: 's1' });
    const dto = { name: 'Shop A' } as any;
    await controller.createStore('m1', user, dto);
    expect(mockStoreService.createStore).toHaveBeenCalledWith(user, 'm1', dto);
  });

  it('updateStore delegates to storeService', async () => {
    mockStoreService.updateStore.mockResolvedValue({ id: 's1' });
    const dto = { name: 'Updated' } as any;
    await controller.updateStore('m1', 's1', user, dto);
    expect(mockStoreService.updateStore).toHaveBeenCalledWith(user, 'm1', 's1', dto);
  });

  it('disableStore delegates to storeService', async () => {
    mockStoreService.disableStore.mockResolvedValue({ id: 's1', isActive: false });
    await controller.disableStore('m1', 's1', user);
    expect(mockStoreService.disableStore).toHaveBeenCalledWith(user, 'm1', 's1');
  });

  it('enableStore delegates to storeService', async () => {
    mockStoreService.enableStore.mockResolvedValue({ id: 's1', isActive: true });
    await controller.enableStore('m1', 's1', user);
    expect(mockStoreService.enableStore).toHaveBeenCalledWith(user, 'm1', 's1');
  });

  it('deleteStore delegates to storeService', async () => {
    mockStoreService.deleteStore.mockResolvedValue({ message: 'deleted' });
    await controller.deleteStore('m1', 's1', user);
    expect(mockStoreService.deleteStore).toHaveBeenCalledWith(user, 'm1', 's1');
  });

  it('listStores passes parsed boolean filter', async () => {
    mockStoreService.listStore.mockResolvedValue([]);
    await controller.listStores('m1', user, 'true');
    expect(mockStoreService.listStore).toHaveBeenCalledWith(user, 'm1', true);
  });

  it('listStores passes undefined filter when not provided', async () => {
    mockStoreService.listStore.mockResolvedValue([]);
    await controller.listStores('m1', user, undefined);
    expect(mockStoreService.listStore).toHaveBeenCalledWith(user, 'm1', undefined);
  });

  it('configureWebhook delegates to storeService', async () => {
    mockStoreService.configureWebhook.mockResolvedValue({ webhookUrl: 'https://hook.example.com', secret: 'sec' });
    const dto = { webhookUrl: 'https://hook.example.com' } as any;
    await controller.configureWebhook('m1', 's1', user, dto);
    expect(mockStoreService.configureWebhook).toHaveBeenCalledWith(user, 'm1', 's1', dto.webhookUrl);
  });

  it('getStore delegates to storeService', async () => {
    mockStoreService.getStore.mockResolvedValue({ id: 's1' });
    await controller.getStore('m1', 's1', user);
    expect(mockStoreService.getStore).toHaveBeenCalledWith(user, 'm1', 's1');
  });
});
