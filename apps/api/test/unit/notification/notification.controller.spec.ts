import { Test, TestingModule } from '@nestjs/testing';
import { NotificationController } from 'src/notification/notification.controller';
import { NotificationService } from 'src/notification/notification.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';

const allowAll = { canActivate: () => true };

const mockNotificationService = {
  putExpoToken: jest.fn(),
};

const user = { id: 'd1', role: 'DRIVER' } as any;

describe('NotificationController', () => {
  let controller: NotificationController;

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificationController],
      providers: [{ provide: NotificationService, useValue: mockNotificationService }],
    })
      .overrideGuard(JwtAuthGuard).useValue(allowAll)
      .overrideGuard(RolesGuard).useValue(allowAll)
      .compile();
    controller = module.get(NotificationController);
  });

  it('putExpoToken delegates to notificationService', async () => {
    mockNotificationService.putExpoToken.mockResolvedValue({ message: 'ok' });
    const dto = { token: 'ExponentPushToken[abc]' } as any;
    await controller.putExpoToken(user, dto);
    expect(mockNotificationService.putExpoToken).toHaveBeenCalledWith(user, dto);
  });
});
