import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiHeader,
  ApiOkResponse,
  ApiOperation,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiTags,
  ApiQuery,
} from '@nestjs/swagger';
import { ApiKeyGuard } from '../../auth/guards/api-key.guard';
import { CurrentMerchantApi } from '../../auth/decorators/current-merchant-api.decorator';
import type { MerchantApiPrincipal } from '../../auth/api-key.service';
import { OrderService } from '../merchants/order-merchants.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { CreateOrderResponseDto } from '../dto/create-order-response';
import { CancelOrderResponseDto } from '../dto/cancel-order-response';
import { ListMerchantOrdersResponseDto } from '../dto/list-merchant-orders-response';

@ApiTags('[Plugin]')
@ApiHeader({
  name: 'x-api-key',
  description: 'API key scoped to merchant and store',
  required: true,
})
@Controller('plugin/orders')
@UseGuards(ApiKeyGuard)
export class OrderPluginController {
  constructor(private readonly orderService: OrderService) {}

  @ApiOperation({
    summary: 'Create an order',
    description:
      'Creates an order using credentials from the API key. merchantId and storeId are resolved from the key.',
  })
  @ApiCreatedResponse({ type: CreateOrderResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing API key' })
  @ApiNotFoundResponse({ description: 'Merchant or store not found' })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createOrder(
    @CurrentMerchantApi() merchant: MerchantApiPrincipal,
    @Body() dto: CreateOrderDto,
  ) {
    return this.orderService.createOrder(
      null,
      merchant.storeId,
      merchant.merchantId,
      dto,
    );
  }

  @ApiOperation({
    summary: 'List orders',
    description:
      'Returns all orders for the merchant. Filter by orderReference (WooCommerce/Shopify order ID) to find a specific order.',
  })
  @ApiQuery({
    name: 'orderReference',
    required: false,
    description: 'External order reference (e.g. WooCommerce order #1042)',
  })
  @ApiOkResponse({ type: ListMerchantOrdersResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing API key' })
  @ApiNotFoundResponse({ description: 'Merchant not found' })
  @Get()
  @HttpCode(HttpStatus.OK)
  async listOrders(
    @CurrentMerchantApi() merchant: MerchantApiPrincipal,
    @Query('orderReference') orderReference?: string,
  ) {
    return this.orderService.getMerchantOrders(
      null,
      merchant.merchantId,
      orderReference,
    );
  }

  @ApiOperation({
    summary: 'Cancel an order by external reference',
    description:
      'Cancels an order using the external orderReference. Cannot cancel if already picked up, delivered, or cancelled.',
  })
  @ApiOkResponse({ type: CancelOrderResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing API key' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @ApiConflictResponse({
    description: 'Order already picked up, delivered, or cancelled',
  })
  @Post('cancel')
  @HttpCode(HttpStatus.OK)
  async cancelOrder(
    @CurrentMerchantApi() merchant: MerchantApiPrincipal,
    @Query('orderReference') orderReference: string,
  ) {
    return this.orderService.cancelOrderByReference(
      merchant.merchantId,
      orderReference,
    );
  }
}
