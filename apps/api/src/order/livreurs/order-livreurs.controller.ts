import {
  Controller,
  Get,
  Post,
  HttpCode,
  HttpStatus,
  UseGuards,
  Param,
  Query,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../../auth/auth.types';
import { OrderLivreursService } from './order-livreurs.service';
import { ListDriverOrdersResponseDto } from '../dto/list-livreurs-orders-response';
import { HandshakeDto } from '../dto/handshake.dto';

@ApiTags('[Web][Livreurs]')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('/livreurs/:driverId')
export class OrderLivreursController {
  constructor(private readonly orderLivreursService: OrderLivreursService) {}

  @ApiTags('[Admin]')
  @ApiOperation({
    summary: 'List orders for a driver',
    description:
      'Filter by status group: active (accepted/picked up), finished (delivered), or cancelled. Returns all orders if no filter provided.',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['active', 'finished', 'cancelled'],
    description: 'Filter orders by status group',
  })
  @ApiOkResponse({ type: ListDriverOrdersResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this driver account',
  })
  @ApiNotFoundResponse({ description: 'Driver not found' })
  @Roles(Role.DRIVER, Role.ADMIN)
  @Get('/orders')
  @HttpCode(HttpStatus.OK)
  async listOrders(
    @Param('driverId') driverId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('filter') filter?: 'active' | 'finished' | 'cancelled',
  ) {
    return this.orderLivreursService.listDriverOrders(user, driverId, filter);
  }

  @ApiOperation({
    summary: 'Accept an available order',
    description:
      'Atomically claims an order in SEARCHING_DRIVER status. Returns 409 if another driver accepted it first.',
  })
  @ApiOkResponse({
    description: 'Order accepted successfully',
    schema: { properties: { message: { type: 'string' } } },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this driver account',
  })
  @ApiNotFoundResponse({ description: 'Driver or order not found' })
  @ApiConflictResponse({
    description: 'Order was already accepted by another driver',
  })
  @Roles(Role.DRIVER)
  @Post('/orders/:orderId/accept')
  @HttpCode(HttpStatus.OK)
  async acceptOrder(
    @Param('driverId') driverId: string,
    @Param('orderId') orderId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderLivreursService.acceptOrder(user, driverId, orderId);
  }

  @ApiOperation({
    summary: 'Driver picks up an order',
    description:
      'Handshake type A, merchant provides driver a code, driver must enters the code to validate the pick up. Driver only have 3 attempts !',
  })
  @ApiOkResponse({
    description: 'Order picked up successfully',
    schema: {
      properties: { orderId: { type: 'string' }, message: { type: 'string' } },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this driver account',
  })
  @ApiNotFoundResponse({ description: 'Driver or order not found' })
  @ApiConflictResponse({
    description: 'Order was already picked up, or was cancelled',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Order has bad status or handshake not created/found, this should not happen. Ask your backend developer, Khoa, for info !',
  })
  @ApiTooManyRequestsResponse({
    description:
      'Driver entered too many false handshake code (3 false attempts allowed)',
  })
  @Roles(Role.DRIVER)
  @Post('/orders/:orderId/pickup')
  @HttpCode(HttpStatus.OK)
  async pickupOrder(
    @Param('driverId') driverId: string,
    @Param('orderId') orderId: string,
    @Body() dto: HandshakeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderLivreursService.pickupOrder(
      user,
      driverId,
      orderId,
      dto.code,
    );
  }

  @ApiOperation({
    summary: 'Retrieve OTP pickup code for an order',
    description:
      'Allows the driver to retrieve the handshake type A pickup code in case the app was closed. Only available while the order is in DRIVER_ACCEPTED status.',
  })
  @ApiOkResponse({
    schema: { properties: { code: { type: 'string', example: '048291' } } },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this driver account',
  })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiInternalServerErrorResponse({
    description:
      'Handshake not found or order was in bad status, contact backend developer',
  })
  @Roles(Role.DRIVER)
  @Get('/orders/:orderId/otp')
  @HttpCode(HttpStatus.OK)
  async getOTP(
    @Param('driverId') driverId: string,
    @Param('orderId') orderId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderLivreursService.getPickupCode(user, driverId, orderId);
  }

  @ApiOperation({
    summary: 'Driver delivers an order to a customer',
    description:
      'Handshake type B, customer receives a code, driver must enter the code to validate the delivery',
  })
  @ApiOkResponse({
    description: 'Order delivered successfully',
    schema: {
      properties: { orderId: { type: 'string' }, message: { type: 'string' } },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this driver account',
  })
  @ApiNotFoundResponse({ description: 'Driver or order not found' })
  @ApiConflictResponse({
    description: 'Order was already delivered, or was cancelled',
  })
  @ApiInternalServerErrorResponse({
    description:
      'Order has bad status or handshake not created/found, this should not happen. Ask your backend developer, Khoa, for info !',
  })
  @ApiTooManyRequestsResponse({
    description:
      'Driver entered too many false handshake code (3 false attempts allowed)',
  })
  @Roles(Role.DRIVER)
  @Post('/orders/:orderId/deliver')
  @HttpCode(HttpStatus.OK)
  async deliverOrder(
    @Param('driverId') driverId: string,
    @Param('orderId') orderId: string,
    @Body() dto: HandshakeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderLivreursService.deliverOrder(
      user,
      driverId,
      orderId,
      dto.code,
    );
  }
}
