import { Controller, HttpStatus, UseGuards, Put, HttpCode, Body } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { ExpoTokenDto } from './dto/expo-token.dto';
import { NotificationService } from './notification.service';

@ApiTags('[Mobile] Driver')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DRIVER)
@Controller()
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @ApiOperation({
    summary: 'Register Expo push token',
    description: 'Called by the mobile app on first login or when the token rotates. Required for the driver to receive new order push notifications.',
  })
  @ApiOkResponse({ schema: { properties: { message: { type: 'string' } } } })
  @ApiBody({ type: ExpoTokenDto })
  @Put('driver/me/push-token')
  @HttpCode(HttpStatus.OK)
  async putExpoToken(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ExpoTokenDto,
  ) {
    return this.notificationService.putExpoToken(user, dto);
  }
}
