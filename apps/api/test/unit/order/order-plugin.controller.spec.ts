import { Test, TestingModule } from '@nestjs/testing';
import { OrderPluginController } from 'src/order/plugin/order-plugin.controller';
import { OrderService } from 'src/order/merchants/order-merchants.service';
import { ApiKeyGuard } from 'src/auth/guards/api-key.guard';

const allowAll = { canActivate: () => true };

const mockOrderService = {
  createOrder: jest.fn(),
  getMerchantOrders: jest.fn(),
  cancelOrderByReference: jest.fn(),
};

const merchant = { merchantId: 'm1', storeId: 's1' } as any;

describe('OrderPluginController', () => {
  let controller: OrderPluginController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderPluginController],
      providers: [{ provide: OrderService, useValue: mockOrderService }],
    })
      .overrideGuard(ApiKeyGuard).useValue(allowAll)
      .compile();
    controller = module.get(OrderPluginController);
  });

  it('createOrder passes null user and resolves merchant/store from API key', async () => {
    mockOrderService.createOrder.mockResolvedValue({ id: 'o1' });
    const dto = { customerName: 'Bob' } as any;
    await controller.createOrder(merchant, dto);
    expect(mockOrderService.createOrder).toHaveBeenCalledWith(null, 's1', 'm1', dto);
  });

  it('listOrders delegates to service with merchantId', async () => {
    mockOrderService.getMerchantOrders.mockResolvedValue([]);
    await controller.listOrders(merchant, undefined);
    expect(mockOrderService.getMerchantOrders).toHaveBeenCalledWith(null, 'm1', undefined);
  });

  it('cancelOrder delegates to service by reference', async () => {
    mockOrderService.cancelOrderByReference.mockResolvedValue({ message: 'cancelled' });
    await controller.cancelOrder(merchant, 'REF-001');
    expect(mockOrderService.cancelOrderByReference).toHaveBeenCalledWith('m1', 'REF-001');
  });
});
