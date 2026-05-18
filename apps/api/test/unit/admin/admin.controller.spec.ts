import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from 'src/admin/admin.controller';
import { AdminService } from 'src/admin/admin.service';
import { KycService } from 'src/kyc/kyc.service';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

const allowAll = { canActivate: () => true };

const mockAdminService = {
  getAllMerchants: jest.fn(),
  getMerchant: jest.fn(),
  getAllDrivers: jest.fn(),
  getDriver: jest.fn(),
  getWithdrawals: jest.fn(),
  updateWithdrawal: jest.fn(),
  unlockHandshake: jest.fn(),
};

const mockKycService = {
  approveDriverKyc: jest.fn(),
  rejectDriverKyc: jest.fn(),
};

const mockAuthService = {
  registerAdmin: jest.fn(),
  registerMerchant: jest.fn(),
  registerDriver: jest.fn(),
};

const user = { id: 'admin-1', role: 'ADMIN' } as any;

describe('AdminController', () => {
  let controller: AdminController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        { provide: AdminService, useValue: mockAdminService },
        { provide: KycService, useValue: mockKycService },
        { provide: AuthService, useValue: mockAuthService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue(allowAll)
      .overrideGuard(RolesGuard).useValue(allowAll)
      .compile();
    controller = module.get(AdminController);
  });

  it('createAdminAccount delegates to authService.registerAdmin', async () => {
    mockAuthService.registerAdmin.mockResolvedValue({ message: 'ok' });
    const dto = { email: 'a@b.com', password: 'pass' } as any;
    await controller.createAdminAccount(dto);
    expect(mockAuthService.registerAdmin).toHaveBeenCalledWith(dto.email, dto.password);
  });

  it('createMerchantAccount delegates to authService.registerMerchant', async () => {
    mockAuthService.registerMerchant.mockResolvedValue({});
    const dto = { email: 'a@b.com' } as any;
    const result = await controller.createMerchantAccount(dto);
    expect(mockAuthService.registerMerchant).toHaveBeenCalledWith(dto);
    expect(result.message).toBeDefined();
  });

  it('createDriverAccount delegates to authService.registerDriver', async () => {
    mockAuthService.registerDriver.mockResolvedValue({});
    const dto = { email: 'd@b.com' } as any;
    const result = await controller.createDriverAccount(dto);
    expect(mockAuthService.registerDriver).toHaveBeenCalledWith(dto);
    expect(result.message).toBeDefined();
  });

  it('getAllMerchants delegates to adminService', async () => {
    mockAdminService.getAllMerchants.mockResolvedValue([]);
    const result = await controller.getAllMerchants();
    expect(mockAdminService.getAllMerchants).toHaveBeenCalled();
    expect(result).toEqual([]);
  });

  it('getMerchant delegates to adminService', async () => {
    mockAdminService.getMerchant.mockResolvedValue({ userId: 'm1' });
    const result = await controller.getMerchant('m1');
    expect(mockAdminService.getMerchant).toHaveBeenCalledWith('m1');
    expect(result).toEqual({ userId: 'm1' });
  });

  it('getAllDrivers delegates to adminService with filters', async () => {
    mockAdminService.getAllDrivers.mockResolvedValue([]);
    await controller.getAllDrivers('AVAILABLE', 'PENDING');
    expect(mockAdminService.getAllDrivers).toHaveBeenCalledWith('AVAILABLE', 'PENDING');
  });

  it('getDriver delegates to adminService', async () => {
    mockAdminService.getDriver.mockResolvedValue({ userId: 'd1' });
    await controller.getDriver('d1');
    expect(mockAdminService.getDriver).toHaveBeenCalledWith('d1');
  });

  it('getWithdrawals delegates to adminService', async () => {
    mockAdminService.getWithdrawals.mockResolvedValue([]);
    await controller.getWithdrawals('PENDING');
    expect(mockAdminService.getWithdrawals).toHaveBeenCalledWith('PENDING');
  });

  it('updateWithdrawal delegates to adminService', async () => {
    mockAdminService.updateWithdrawal.mockResolvedValue({ message: 'ok' });
    await controller.updateWithdrawal('e1', { status: 'COMPLETED' } as any);
    expect(mockAdminService.updateWithdrawal).toHaveBeenCalledWith('e1', 'COMPLETED');
  });

  it('approveKyc delegates to kycService', async () => {
    mockKycService.approveDriverKyc.mockResolvedValue({ message: 'ok' });
    await controller.approveKyc('d1');
    expect(mockKycService.approveDriverKyc).toHaveBeenCalledWith('d1');
  });

  it('rejectKyc delegates to kycService', async () => {
    mockKycService.rejectDriverKyc.mockResolvedValue({ message: 'ok' });
    await controller.rejectKyc('d1', { rejectionReason: 'bad docs' } as any);
    expect(mockKycService.rejectDriverKyc).toHaveBeenCalledWith('d1', 'bad docs');
  });

  it('resetHandshake delegates to adminService', async () => {
    mockAdminService.unlockHandshake.mockResolvedValue({ message: 'ok' });
    await controller.resetHandshake('o1');
    expect(mockAdminService.unlockHandshake).toHaveBeenCalledWith('o1');
  });
});
