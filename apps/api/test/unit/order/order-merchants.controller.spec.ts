import { Test, TestingModule } from '@nestjs/testing';
import { OrderMerchantsController } from 'src/order/merchants/order-merchants.controller';
import { OrderService } from 'src/order/merchants/order-merchants.service';
import { JwtOrApiKeyGuard } from 'src/auth/guards/jwt-or-api-key.guard';
import { EmailVerifiedGuard } from 'src/auth/guards/email-verified.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

const allowAll = { canActivate: () => true };

const mockOrderService = {
  createOrder: jest.fn(),
  getMerchantOrders: jest.fn(),
  getOrder: jest.fn(),
  verifyPickup: jest.fn(),
  cancelOrder: jest.fn(),
};

const user = { id: 'm1', role: 'MERCHANT' } as any;

describe('OrderMerchantsController', () => {
  let controller: OrderMerchantsController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderMerchantsController],
      providers: [{ provide: OrderService, useValue: mockOrderService }],
    })
      .overrideGuard(JwtOrApiKeyGuard).useValue(allowAll)
      .overrideGuard(EmailVerifiedGuard).useValue(allowAll)
      .overrideGuard(RolesGuard).useValue(allowAll)
      .compile();
    controller = module.get(OrderMerchantsController);
  });

  it('createOrder delegates to service', async () => {
    mockOrderService.createOrder.mockResolvedValue({ id: 'o1' });
    const dto = { customerName: 'Alice' } as any;
    await controller.createOrder('s1', 'm1', dto, user);
    expect(mockOrderService.createOrder).toHaveBeenCalledWith(user, 's1', 'm1', dto);
  });

  it('listOrders delegates to service', async () => {
    mockOrderService.getMerchantOrders.mockResolvedValue([]);
    await controller.listOrders('m1', user);
    expect(mockOrderService.getMerchantOrders).toHaveBeenCalledWith(user, 'm1');
  });

  it('getOrder delegates to service', async () => {
    mockOrderService.getOrder.mockResolvedValue({ id: 'o1' });
    await controller.getOrder('m1', 'o1', user);
    expect(mockOrderService.getOrder).toHaveBeenCalledWith(user, 'm1', 'o1');
  });

  it('verifyPickup delegates to service with code', async () => {
    mockOrderService.verifyPickup.mockResolvedValue({ message: 'ok' });
    const dto = { code: '123456' } as any;
    await controller.verifyPickup('s1', 'm1', user, dto);
    expect(mockOrderService.verifyPickup).toHaveBeenCalledWith(user, 'm1', 's1', '123456');
  });

  it('cancelOrder delegates to service', async () => {
    mockOrderService.cancelOrder.mockResolvedValue({ message: 'cancelled' });
    await controller.cancelOrder('m1', 'o1', user);
    expect(mockOrderService.cancelOrder).toHaveBeenCalledWith(user, 'm1', 'o1');
  });
});
