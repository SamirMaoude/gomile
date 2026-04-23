import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  Param,
  Body,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiOkResponse,
  ApiHeader,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
} from '@nestjs/swagger';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CancelOrderResponseDto } from '../dto/cancel-order-response';
import { CreateOrderDto } from '../dto/create-order.dto';
import { CreateOrderResponseDto } from '../dto/create-order-response';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import type { AuthenticatedUser } from '../../auth/auth.types';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { OrderService } from './order-merchants.service';
import { JwtOrApiKeyGuard } from '../../auth/guards/jwt-or-api-key.guard';
import { GetOrderResponseDto } from '../dto/get-order-response.dto';
import { ListMerchantOrdersResponseDto } from '../dto/list-merchant-orders-response';
import { HandshakeDto } from '../dto/handshake.dto';

@ApiTags('[Web][Merchant]')
@Controller('/merchants/:merchantId')
export class OrderMerchantsController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({
    summary: 'Create an order',
    description:
      'Accepts JWT bearer token or x-api-key header. Returns pickup code (show to merchant) and delivery code (send to customer).',
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key scoped to this merchant and store',
    required: false,
  })
  @ApiBearerAuth('access-token')
  @ApiBody({ type: CreateOrderDto })
  @ApiCreatedResponse({ type: CreateOrderResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing credentials' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this merchant account',
  })
  @ApiNotFoundResponse({ description: 'Merchant or store not found' })
  @UseGuards(JwtOrApiKeyGuard, RolesGuard)
  @Roles(Role.MERCHANT)
  @Post('/stores/:storeId/orders')
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @Param('storeId') storeId: string,
    @Param('merchantId') merchantId: string,
    @Body() dto: CreateOrderDto,
    @CurrentUser() user: AuthenticatedUser | null,
  ) {
    return this.orderService.createOrder(user, storeId, merchantId, dto);
  }

  @ApiTags('[Admin]')
  @ApiOperation({
    summary: 'List all orders for a merchant',
    description:
      'Merchants can only list their own orders. Admins can list orders for any merchant.',
  })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: ListMerchantOrdersResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this merchant account',
  })
  @ApiNotFoundResponse({ description: 'Merchant not found' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT, Role.ADMIN)
  @Get('/orders')
  @HttpCode(HttpStatus.OK)
  async listOrders(
    @Param('merchantId') merchantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderService.getMerchantOrders(user, merchantId);
  }

  @ApiOperation({
    summary: 'Get a specific order',
    description: 'Accepts JWT bearer token or x-api-key header.',
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key scoped to this merchant',
    required: false,
  })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: GetOrderResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing credentials' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this order',
  })
  @ApiNotFoundResponse({ description: 'Merchant or order not found' })
  @UseGuards(JwtOrApiKeyGuard, RolesGuard)
  @Roles(Role.MERCHANT)
  @Get('/orders/:orderId')
  @HttpCode(HttpStatus.OK)
  async getOrder(
    @Param('merchantId') merchantId: string,
    @Param('orderId') orderId: string,
    @CurrentUser() user: AuthenticatedUser | null,
  ) {
    return this.orderService.getOrder(user, merchantId, orderId);
  }

  @ApiOperation({
    summary: 'Verify driver pickup handshake',
    description: 'Merchant enters the code shown by the driver',
  })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({
    schema: {
      properties: { orderId: { type: 'string' }, message: { type: 'string' } },
    },
  })
  @ApiNotFoundResponse({
    description: 'Code not found or expired, store not exists',
  })
  @ApiConflictResponse({ description: 'Order not in correct state' })
  @ApiInternalServerErrorResponse({
    description: 'Handshake not found, suggesting a deeper backend issue',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.MERCHANT)
  @Post('/stores/:storeId/orders/handshake/verify')
  @HttpCode(HttpStatus.OK)
  async verifyPickup(
    @Param('storeId') storeId: string,
    @Param('merchantId') merchantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: HandshakeDto,
  ) {
    return this.orderService.verifyPickup(user, merchantId, storeId, dto.code);
  }

  @ApiOperation({
    summary: 'Cancel an order',
    description:
      'Accepts JWT bearer token or x-api-key header. Cannot cancel an order that is already picked up, delivered, or cancelled.',
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API key scoped to this merchant',
    required: false,
  })
  @ApiBearerAuth('access-token')
  @ApiOkResponse({ type: CancelOrderResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing credentials' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this order',
  })
  @ApiNotFoundResponse({ description: 'Merchant or order not found' })
  @ApiConflictResponse({
    description: 'Order is already picked up, delivered, or cancelled',
  })
  @UseGuards(JwtOrApiKeyGuard, RolesGuard)
  @Roles(Role.MERCHANT)
  @Post('/orders/:orderId/cancel')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @Param('merchantId') merchantId: string,
    @Param('orderId') orderId: string,
    @CurrentUser() user: AuthenticatedUser | null,
  ) {
    return this.orderService.cancelOrder(user, merchantId, orderId);
  }
}
