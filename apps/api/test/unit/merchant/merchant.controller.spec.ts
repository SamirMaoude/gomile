import { Test, TestingModule } from '@nestjs/testing';
import { MerchantController } from 'src/merchant/merchant.controller';
import { MerchantService } from 'src/merchant/merchant.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from 'src/auth/guards/email-verified.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

const allowAll = { canActivate: () => true };

const mockMerchantService = {
  getMerchant: jest.fn(),
  updateMerchant: jest.fn(),
  deleteMerchant: jest.fn(),
};

const user = { id: 'm1', role: 'MERCHANT' } as any;

describe('MerchantController', () => {
  let controller: MerchantController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MerchantController],
      providers: [{ provide: MerchantService, useValue: mockMerchantService }],
    })
      .overrideGuard(JwtAuthGuard).useValue(allowAll)
      .overrideGuard(EmailVerifiedGuard).useValue(allowAll)
      .overrideGuard(RolesGuard).useValue(allowAll)
      .compile();
    controller = module.get(MerchantController);
  });

  it('getProfile delegates to merchantService', async () => {
    mockMerchantService.getMerchant.mockResolvedValue({ userId: 'm1' });
    await controller.getProfile('m1', user);
    expect(mockMerchantService.getMerchant).toHaveBeenCalledWith(user, 'm1');
  });

  it('update delegates to merchantService', async () => {
    mockMerchantService.updateMerchant.mockResolvedValue({ message: 'ok' });
    const dto = { name: 'New Name' } as any;
    await controller.update('m1', dto, user);
    expect(mockMerchantService.updateMerchant).toHaveBeenCalledWith(user, 'm1', dto);
  });

  it('delete delegates to merchantService', async () => {
    mockMerchantService.deleteMerchant.mockResolvedValue({ message: 'ok' });
    await controller.delete('m1', user);
    expect(mockMerchantService.deleteMerchant).toHaveBeenCalledWith(user, 'm1');
  });
});
