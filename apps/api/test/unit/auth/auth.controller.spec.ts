import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { JwtRefreshGuard } from 'src/auth/guards/jwt-refresh.guard';

const allowAll = { canActivate: () => true };

const mockAuthService = {
  registerMerchant: jest.fn(),
  registerDriver: jest.fn(),
  login: jest.fn(),
  refresh: jest.fn(),
  verifyEmail: jest.fn(),
  forgotPassword: jest.fn(),
  verifyOtp: jest.fn(),
  resetPassword: jest.fn(),
  getEmailStatus: jest.fn(),
  logout: jest.fn(),
  generateWsToken: jest.fn(),
};

const user = { id: 'u1', email: 'u@test.com', role: 'MERCHANT' } as any;
const refreshUser = { id: 'u1', email: 'u@test.com', role: 'MERCHANT', currentRefreshToken: 'tok' } as any;

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtAuthGuard).useValue(allowAll)
      .overrideGuard(JwtRefreshGuard).useValue(allowAll)
      .compile();
    controller = module.get(AuthController);
  });

  it('registerMerchant delegates to authService', async () => {
    mockAuthService.registerMerchant.mockResolvedValue({ accessToken: 'tok' });
    const dto = { email: 'm@test.com', password: 'pass' } as any;
    await controller.registerMerchant(dto);
    expect(mockAuthService.registerMerchant).toHaveBeenCalledWith(dto);
  });

  it('registerDriver delegates to authService', async () => {
    mockAuthService.registerDriver.mockResolvedValue({ accessToken: 'tok' });
    const dto = { email: 'd@test.com', password: 'pass' } as any;
    await controller.registerDriver(dto);
    expect(mockAuthService.registerDriver).toHaveBeenCalledWith(dto);
  });

  it('login delegates to authService', async () => {
    mockAuthService.login.mockResolvedValue({ accessToken: 'tok' });
    const dto = { email: 'u@test.com', password: 'pass' } as any;
    await controller.login(dto);
    expect(mockAuthService.login).toHaveBeenCalledWith(dto);
  });

  it('refresh delegates to authService with user fields', async () => {
    mockAuthService.refresh.mockResolvedValue({ accessToken: 'new' });
    await controller.refresh(refreshUser);
    expect(mockAuthService.refresh).toHaveBeenCalledWith('u1', 'u@test.com', 'MERCHANT', 'tok');
  });

  it('verifyEmail delegates to authService', async () => {
    mockAuthService.verifyEmail.mockResolvedValue({ message: 'ok' });
    const dto = { token: 'abc' } as any;
    await controller.verifyEmail(dto);
    expect(mockAuthService.verifyEmail).toHaveBeenCalledWith(dto);
  });

  it('forgotPassword delegates to authService', async () => {
    mockAuthService.forgotPassword.mockResolvedValue({ message: 'ok' });
    const dto = { email: 'u@test.com' } as any;
    await controller.forgotPassword(dto);
    expect(mockAuthService.forgotPassword).toHaveBeenCalledWith(dto);
  });

  it('verifyOtp delegates to authService', async () => {
    mockAuthService.verifyOtp.mockResolvedValue({ resetToken: 'tok' });
    const dto = { email: 'u@test.com', otp: '123456' } as any;
    await controller.verifyOtp(dto);
    expect(mockAuthService.verifyOtp).toHaveBeenCalledWith(dto);
  });

  it('resetPassword delegates to authService', async () => {
    mockAuthService.resetPassword.mockResolvedValue({ message: 'ok' });
    const dto = { resetToken: 'tok', newPassword: 'new' } as any;
    await controller.resetPassword(dto);
    expect(mockAuthService.resetPassword).toHaveBeenCalledWith(dto);
  });

  it('emailStatus delegates to authService', async () => {
    mockAuthService.getEmailStatus.mockResolvedValue({ emailVerified: true });
    await controller.emailStatus(user);
    expect(mockAuthService.getEmailStatus).toHaveBeenCalledWith('u1');
  });

  it('logout delegates to authService', async () => {
    mockAuthService.logout.mockResolvedValue({ message: 'ok' });
    await controller.logout(user);
    expect(mockAuthService.logout).toHaveBeenCalledWith('u1');
  });

  it('getWsToken delegates to authService', async () => {
    mockAuthService.generateWsToken.mockResolvedValue({ token: 'ws-tok' });
    await controller.getWsToken(user);
    expect(mockAuthService.generateWsToken).toHaveBeenCalledWith(user);
  });
});
