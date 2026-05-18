import { Test, TestingModule } from '@nestjs/testing';
import { DriverMeController } from 'src/driver/driver-me.controller';
import { DriverMeService } from 'src/driver/driver-me.service';
import { OrderLivreursService } from 'src/order/livreurs/order-livreurs.service';
import { KycService } from 'src/kyc/kyc.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from 'src/auth/guards/email-verified.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

const allowAll = { canActivate: () => true };

const mockDriverMeService = {
  availableOrders: jest.fn(),
  rejectOrder: jest.fn(),
  updateDriverPosition: jest.fn(),
  toggleDriverAvailability: jest.fn(),
  getActiveOrders: jest.fn(),
  getPastOrders: jest.fn(),
  getDriverProfile: jest.fn(),
  updateDriverProfile: jest.fn(),
  updateSessionVehicle: jest.fn(),
  getDashboard: jest.fn(),
  getWallet: jest.fn(),
  getWalletEntries: jest.fn(),
  requestWithdrawal: jest.fn(),
  presignDocument: jest.fn(),
  getDocuments: jest.fn(),
  uploadDocument: jest.fn(),
  deleteDocument: jest.fn(),
};

const mockOrderLivreursService = {
  acceptOrder: jest.fn(),
  getPickupCode: jest.fn(),
  pickupOrder: jest.fn(),
  deliverOrder: jest.fn(),
};

const mockKycService = {
  getMyKycStatus: jest.fn(),
  submitKyc: jest.fn(),
};

const user = { id: 'd1', role: 'DRIVER' } as any;

describe('DriverMeController', () => {
  let controller: DriverMeController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DriverMeController],
      providers: [
        { provide: DriverMeService, useValue: mockDriverMeService },
        { provide: OrderLivreursService, useValue: mockOrderLivreursService },
        { provide: KycService, useValue: mockKycService },
      ],
    })
      .overrideGuard(JwtAuthGuard).useValue(allowAll)
      .overrideGuard(EmailVerifiedGuard).useValue(allowAll)
      .overrideGuard(RolesGuard).useValue(allowAll)
      .compile();
    controller = module.get(DriverMeController);
  });

  it('availableMissions delegates to driverMeService', async () => {
    mockDriverMeService.availableOrders.mockResolvedValue([]);
    await controller.availableMissions(user);
    expect(mockDriverMeService.availableOrders).toHaveBeenCalledWith(user);
  });

  it('rejectMission delegates to driverMeService', async () => {
    mockDriverMeService.rejectOrder.mockResolvedValue({ message: 'ok' });
    await controller.rejectMission('o1', user);
    expect(mockDriverMeService.rejectOrder).toHaveBeenCalledWith(user, 'o1');
  });

  it('acceptMission delegates to orderLivreursService', async () => {
    mockOrderLivreursService.acceptOrder.mockResolvedValue({ message: 'accepted' });
    await controller.acceptMission('o1', user);
    expect(mockOrderLivreursService.acceptOrder).toHaveBeenCalledWith(user, user.id, 'o1');
  });

  it('getPickupCode delegates to orderLivreursService', async () => {
    mockOrderLivreursService.getPickupCode.mockResolvedValue({ pickupCode: '123456' });
    await controller.getPickupCode('o1', user);
    expect(mockOrderLivreursService.getPickupCode).toHaveBeenCalledWith(user, user.id, 'o1');
  });

  it('getOTP delegates to orderLivreursService', async () => {
    mockOrderLivreursService.getPickupCode.mockResolvedValue({ code: '123456' });
    await controller.getOTP('o1', user);
    expect(mockOrderLivreursService.getPickupCode).toHaveBeenCalledWith(user, user.id, 'o1');
  });

  it('pickupMission delegates to orderLivreursService with code', async () => {
    mockOrderLivreursService.pickupOrder.mockResolvedValue({ message: 'picked up' });
    const dto = { code: '048291' } as any;
    await controller.pickupMission('o1', dto, user);
    expect(mockOrderLivreursService.pickupOrder).toHaveBeenCalledWith(user, user.id, 'o1', '048291');
  });

  it('deliverMission delegates to orderLivreursService with code', async () => {
    mockOrderLivreursService.deliverOrder.mockResolvedValue({ message: 'delivered' });
    const dto = { code: '654321' } as any;
    await controller.deliverMission('o1', dto, user);
    expect(mockOrderLivreursService.deliverOrder).toHaveBeenCalledWith(user, user.id, 'o1', '654321');
  });

  it('updateLocation delegates to driverMeService', async () => {
    mockDriverMeService.updateDriverPosition.mockResolvedValue({ message: 'ok' });
    const dto = { latitude: 48.8, longitude: 2.3 } as any;
    await controller.updateLocation(dto, user);
    expect(mockDriverMeService.updateDriverPosition).toHaveBeenCalledWith(user, 48.8, 2.3);
  });

  it('toggleDriverStatus delegates to driverMeService', async () => {
    mockDriverMeService.toggleDriverAvailability.mockResolvedValue({ message: 'ok' });
    await controller.toggleDriverStatus(user);
    expect(mockDriverMeService.toggleDriverAvailability).toHaveBeenCalledWith(user);
  });

  it('getActiveMissions delegates to driverMeService', async () => {
    mockDriverMeService.getActiveOrders.mockResolvedValue([]);
    await controller.getActiveMissions(user);
    expect(mockDriverMeService.getActiveOrders).toHaveBeenCalledWith(user);
  });

  it('getMissionsHistory delegates to driverMeService', async () => {
    mockDriverMeService.getPastOrders.mockResolvedValue([]);
    await controller.getMissionsHistory(user);
    expect(mockDriverMeService.getPastOrders).toHaveBeenCalledWith(user);
  });

  it('getProfile delegates to driverMeService', async () => {
    mockDriverMeService.getDriverProfile.mockResolvedValue({ userId: 'd1' });
    await controller.getProfile(user);
    expect(mockDriverMeService.getDriverProfile).toHaveBeenCalledWith(user);
  });

  it('updateProfile delegates to driverMeService', async () => {
    mockDriverMeService.updateDriverProfile.mockResolvedValue({ message: 'ok' });
    const dto = { firstName: 'Jean' } as any;
    await controller.updateProfile(dto, user);
    expect(mockDriverMeService.updateDriverProfile).toHaveBeenCalledWith(user, dto);
  });

  it('updateSessionVehicle delegates to driverMeService', async () => {
    mockDriverMeService.updateSessionVehicle.mockResolvedValue({ activeVehicle: 'BIKE' });
    const dto = { vehicleType: 'BIKE' } as any;
    await controller.updateSessionVehicle(user, dto);
    expect(mockDriverMeService.updateSessionVehicle).toHaveBeenCalledWith(user, dto);
  });

  it('getKycStatus delegates to kycService', async () => {
    mockKycService.getMyKycStatus.mockResolvedValue({ kycStatus: 'PENDING' });
    await controller.getKycStatus(user);
    expect(mockKycService.getMyKycStatus).toHaveBeenCalledWith('d1');
  });

  it('submitKyc delegates to kycService', async () => {
    mockKycService.submitKyc.mockResolvedValue({ message: 'submitted' });
    await controller.submitKyc(user);
    expect(mockKycService.submitKyc).toHaveBeenCalledWith('d1');
  });

  it('getDriverDashboard delegates to driverMeService', async () => {
    mockDriverMeService.getDashboard.mockResolvedValue({ status: 'AVAILABLE' });
    await controller.getDriverDashboard(user);
    expect(mockDriverMeService.getDashboard).toHaveBeenCalledWith(user);
  });

  it('getWallet delegates to driverMeService', async () => {
    mockDriverMeService.getWallet.mockResolvedValue({ balance: 100 });
    await controller.getWallet(user);
    expect(mockDriverMeService.getWallet).toHaveBeenCalledWith(user);
  });

  it('getWalletEntries delegates to driverMeService', async () => {
    mockDriverMeService.getWalletEntries.mockResolvedValue([]);
    await controller.getWalletEntries(user);
    expect(mockDriverMeService.getWalletEntries).toHaveBeenCalledWith(user);
  });

  it('requestWithdrawal delegates to driverMeService', async () => {
    mockDriverMeService.requestWithdrawal.mockResolvedValue({ message: 'ok' });
    const dto = { amount: 50 } as any;
    await controller.requestWithdrawal(user, dto);
    expect(mockDriverMeService.requestWithdrawal).toHaveBeenCalledWith(user, 50);
  });

  it('presignDocument delegates to driverMeService', async () => {
    mockDriverMeService.presignDocument.mockResolvedValue({ uploadUrl: 'url', fileUrl: 'url2' });
    const dto = { filename: 'doc.pdf', contentType: 'application/pdf' } as any;
    await controller.presignDocument(dto);
    expect(mockDriverMeService.presignDocument).toHaveBeenCalledWith('doc.pdf', 'application/pdf');
  });

  it('getDocuments delegates to driverMeService', async () => {
    mockDriverMeService.getDocuments.mockResolvedValue([]);
    await controller.getDocuments(user);
    expect(mockDriverMeService.getDocuments).toHaveBeenCalledWith(user);
  });

  it('uploadDocument delegates to driverMeService', async () => {
    mockDriverMeService.uploadDocument.mockResolvedValue({ id: 'doc1' });
    const dto = { type: 'LICENSE', url: 'https://s3.example.com/doc.pdf' } as any;
    await controller.uploadDocument(user, dto);
    expect(mockDriverMeService.uploadDocument).toHaveBeenCalledWith(user, dto);
  });

  it('deleteDocument delegates to driverMeService', async () => {
    mockDriverMeService.deleteDocument.mockResolvedValue({ message: 'ok' });
    await controller.deleteDocument(user, 'doc1');
    expect(mockDriverMeService.deleteDocument).toHaveBeenCalledWith(user, 'doc1');
  });
});
