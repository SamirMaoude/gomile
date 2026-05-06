import {
  Body,
  UseGuards,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Patch,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { StoreService } from './store.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailVerifiedGuard } from '../auth/guards/email-verified.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CreateStoreDto } from './dto/create-store.dto';
import { CreateStoreResponseDto } from './dto/create-store-response.dto';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { UpdateStoreDto } from './dto/update-store.dto';
import { UpdateStoreResponseDto } from './dto/update-store.response.dto';
import { DeleteStoreResponseDto } from './dto/delete-store-response.dto';
import { GetStoreResponseDto } from './dto/get-store-response.dto';
import { ListStoresResponseDto } from './dto/list-stores-response.dto';
import { ConfigureWebhookDto } from './dto/configure-webhook.dto';
import { ConfigureWebhookResponseDto } from './dto/configure-webhook-response.dto';

@ApiTags('[Web][Store]')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, EmailVerifiedGuard, RolesGuard)
@Controller('merchants/:merchantId/stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @ApiOperation({
    summary: 'Create a store',
    description: 'If provider is set, domain is required.',
  })
  @ApiBody({ type: CreateStoreDto })
  @ApiCreatedResponse({ type: CreateStoreResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this merchant account',
  })
  @ApiNotFoundResponse({ description: 'Merchant not found' })
  @ApiConflictResponse({ description: 'Provider set without a domain' })
  @Roles(Role.MERCHANT)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createStore(
    @Param('merchantId') merchantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateStoreDto,
  ): Promise<CreateStoreResponseDto> {
    return await this.storeService.createStore(user, merchantId, dto);
  }

  @ApiOperation({ summary: 'Update a store' })
  @ApiBody({ type: UpdateStoreDto })
  @ApiOkResponse({ type: UpdateStoreResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this store',
  })
  @ApiNotFoundResponse({ description: 'Merchant or store not found' })
  @ApiConflictResponse({
    description: 'Provider set without a domain on the store',
  })
  @Roles(Role.MERCHANT)
  @Patch(':storeId')
  @HttpCode(HttpStatus.OK)
  async updateStore(
    @Param('merchantId') merchantId: string,
    @Param('storeId') storeId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateStoreDto,
  ): Promise<UpdateStoreResponseDto> {
    return this.storeService.updateStore(user, merchantId, storeId, dto);
  }

  @ApiOperation({
    summary: 'Disable a store',
    description: 'Store will no longer accept new orders.',
  })
  @ApiOkResponse({ type: UpdateStoreResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this store',
  })
  @ApiNotFoundResponse({ description: 'Merchant or store not found' })
  @Roles(Role.MERCHANT)
  @Post(':storeId/disable')
  @HttpCode(HttpStatus.OK)
  async disableStore(
    @Param('merchantId') merchantId: string,
    @Param('storeId') storeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UpdateStoreResponseDto> {
    return this.storeService.disableStore(user, merchantId, storeId);
  }

  @ApiOperation({
    summary: 'Re-enable a store',
    description: 'Store will start accepting orders again.',
  })
  @ApiOkResponse({ type: UpdateStoreResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this store',
  })
  @ApiNotFoundResponse({ description: 'Merchant or store not found' })
  @Roles(Role.MERCHANT)
  @Post(':storeId/enable')
  @HttpCode(HttpStatus.OK)
  async enableStore(
    @Param('merchantId') merchantId: string,
    @Param('storeId') storeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UpdateStoreResponseDto> {
    return this.storeService.enableStore(user, merchantId, storeId);
  }

  @ApiOperation({
    summary: 'Delete a store',
    description:
      'Permanent deletion. Cannot delete a store with active orders.',
  })
  @ApiOkResponse({ type: DeleteStoreResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this store',
  })
  @ApiNotFoundResponse({ description: 'Merchant or store not found' })
  @Roles(Role.MERCHANT)
  @Delete(':storeId')
  @HttpCode(HttpStatus.OK)
  async deleteStore(
    @Param('merchantId') merchantId: string,
    @Param('storeId') storeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.storeService.deleteStore(user, merchantId, storeId);
  }

  @ApiOperation({
    summary: 'List all stores for a merchant',
    description:
      'Merchants can only list their own stores. Admins can list stores for any merchant because its the admin',
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    type: Boolean,
    description: 'Filter by active/inactive status',
  })
  @ApiOkResponse({ type: ListStoresResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this merchant account',
  })
  @ApiNotFoundResponse({ description: 'Merchant not found' })
  @Roles(Role.MERCHANT, Role.ADMIN)
  @Get()
  @HttpCode(HttpStatus.OK)
  async listStores(
    @Param('merchantId') merchantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Query('isActive') isActive?: string,
  ) {
    const filter = isActive === undefined ? undefined : isActive === 'true';
    return this.storeService.listStore(user, merchantId, filter);
  }

  @ApiOperation({
    summary: 'Configure webhook for a store',
    description: 'Sets the webhook URL and rotates the signing secret. The secret is shown once — store it securely.',
  })
  @ApiBody({ type: ConfigureWebhookDto })
  @ApiOkResponse({ type: ConfigureWebhookResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({ description: 'Authenticated user does not own this store' })
  @ApiNotFoundResponse({ description: 'Store not found' })
  @Roles(Role.MERCHANT)
  @Patch(':storeId/webhook')
  @HttpCode(HttpStatus.OK)
  async configureWebhook(
    @Param('merchantId') merchantId: string,
    @Param('storeId') storeId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: ConfigureWebhookDto,
  ): Promise<ConfigureWebhookResponseDto> {
    return this.storeService.configureWebhook(user, merchantId, storeId, dto.webhookUrl);
  }

  @ApiOperation({ summary: 'Get a specific store' })
  @ApiOkResponse({ type: GetStoreResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this store',
  })
  @ApiNotFoundResponse({ description: 'Merchant or store not found' })
  @Roles(Role.MERCHANT)
  @Get(':storeId')
  @HttpCode(HttpStatus.OK)
  async getStore(
    @Param('merchantId') merchantId: string,
    @Param('storeId') storeId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.storeService.getStore(user, merchantId, storeId);
  }
}
