import { Test, TestingModule } from '@nestjs/testing';
import { OrderLivreursController } from 'src/order/livreurs/order-livreurs.controller';
import { OrderLivreursService } from 'src/order/livreurs/order-livreurs.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from 'src/auth/guards/email-verified.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

const allowAll = { canActivate: () => true };

const mockOrderLivreursService = {
  listDriverOrders: jest.fn(),
  acceptOrder: jest.fn(),
  getPickupCode: jest.fn(),
  deliverOrder: jest.fn(),
};

const user = { id: 'd1', role: 'DRIVER' } as any;

describe('OrderLivreursController', () => {
  let controller: OrderLivreursController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrderLivreursController],
      providers: [{ provide: OrderLivreursService, useValue: mockOrderLivreursService }],
    })
      .overrideGuard(JwtAuthGuard).useValue(allowAll)
      .overrideGuard(EmailVerifiedGuard).useValue(allowAll)
      .overrideGuard(RolesGuard).useValue(allowAll)
      .compile();
    controller = module.get(OrderLivreursController);
  });

  it('listOrders delegates to service', async () => {
    mockOrderLivreursService.listDriverOrders.mockResolvedValue([]);
    await controller.listOrders('d1', user, 'active');
    expect(mockOrderLivreursService.listDriverOrders).toHaveBeenCalledWith(user, 'd1', 'active');
  });

  it('acceptOrder delegates to service', async () => {
    mockOrderLivreursService.acceptOrder.mockResolvedValue({ message: 'ok' });
    await controller.acceptOrder('d1', 'o1', user);
    expect(mockOrderLivreursService.acceptOrder).toHaveBeenCalledWith(user, 'd1', 'o1');
  });

  it('getOTP delegates to service', async () => {
    mockOrderLivreursService.getPickupCode.mockResolvedValue({ code: '123456' });
    await controller.getOTP('d1', 'o1', user);
    expect(mockOrderLivreursService.getPickupCode).toHaveBeenCalledWith(user, 'd1', 'o1');
  });

  it('deliverOrder delegates to service with code', async () => {
    mockOrderLivreursService.deliverOrder.mockResolvedValue({ message: 'delivered' });
    const dto = { code: '654321' } as any;
    await controller.deliverOrder('d1', 'o1', dto, user);
    expect(mockOrderLivreursService.deliverOrder).toHaveBeenCalledWith(user, 'd1', 'o1', '654321');
  });
});
