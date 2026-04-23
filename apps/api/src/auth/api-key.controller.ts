import {
  Controller,
  Post,
  Patch,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
  Param,
  Get,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { ApiKeyService } from './api-key.service';
import { CreateApiKeyDto } from './dto/create-api-key.dto';
import { CreateApiKeyResponseDto } from './dto/create-api-key-response.dto';
import { UpdateApiKeyDto } from './dto/update-api-key.dto';
import { ListApiKeysResponseDto } from './dto/list-api-keys-response.dto';
import { GetApiKeyResponseDto } from './dto/get-api-key-response.dto';
import { UpdateApiKeyResponseDto } from './dto/update-api-key-response.dto';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Roles } from './decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from './decorators/current-user.decorator';
import type { AuthenticatedUser } from './auth.types';

@ApiTags('[Web][api-keys]')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('merchants/:merchantId/api-keys')
export class ApiKeyController {
  constructor(private readonly apiKeyService: ApiKeyService) {}

  @ApiOperation({
    summary: 'Create an API key',
    description:
      'Creates an API key scoped to a specific store. The raw key is only returned once, user must store it securely',
  })
  @ApiBody({ type: CreateApiKeyDto })
  @ApiCreatedResponse({ type: CreateApiKeyResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this merchant account',
  })
  @ApiNotFoundResponse({ description: 'Merchant or store not found' })
  @ApiConflictResponse({ description: 'Store already has an active API key' })
  @Roles(Role.MERCHANT)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createApiKey(
    @Param('merchantId') merchantId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateApiKeyDto,
  ): Promise<CreateApiKeyResponseDto> {
    const newApiKey = await this.apiKeyService.createApiKey(
      user,
      merchantId,
      dto.storeId,
      dto.name,
      dto.expiresAt,
    );
    return {
      id: newApiKey.apiKeyId,
      name: dto.name,
      apiKey: newApiKey.apiKey,
      createdAt: newApiKey.createdAt,
    };
  }

  @ApiOperation({
    summary: 'List all API keys for a merchant',
    description: 'Returns all keys including revoked ones (key info only)',
  })
  @ApiOkResponse({ type: ListApiKeysResponseDto, isArray: true })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this merchant account',
  })
  @ApiNotFoundResponse({ description: 'Merchant not found' })
  @Roles(Role.MERCHANT)
  @Get()
  @HttpCode(HttpStatus.OK)
  async listApiKeys(
    @Param('merchantId') merchantId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.apiKeyService.listApiKeys(user, merchantId);
  }

  @ApiOperation({
    summary: 'Get a single API key with its associated store details',
  })
  @ApiOkResponse({ type: GetApiKeyResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this API key',
  })
  @ApiNotFoundResponse({ description: 'API key not found' })
  @Roles(Role.MERCHANT)
  @Get(':apiKeyId')
  @HttpCode(HttpStatus.OK)
  async getApiKey(
    @Param('merchantId') merchantId: string,
    @Param('apiKeyId') apiKeyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.apiKeyService.getApiKey(user, merchantId, apiKeyId);
  }

  @ApiOperation({ summary: 'Update an API key name or expiration date' })
  @ApiBody({ type: UpdateApiKeyDto })
  @ApiOkResponse({ type: UpdateApiKeyResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description:
      'Authenticated user does not own this API key, or key is revoked',
  })
  @ApiNotFoundResponse({ description: 'API key not found' })
  @Roles(Role.MERCHANT)
  @Patch(':apiKeyId')
  @HttpCode(HttpStatus.OK)
  async updateApiKey(
    @Param('merchantId') merchantId: string,
    @Param('apiKeyId') apiKeyId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdateApiKeyDto,
  ) {
    return this.apiKeyService.updateApiKey(
      user,
      merchantId,
      apiKeyId,
      dto.name,
      dto.expiresAt,
    );
  }

  @ApiOperation({
    summary: 'Revoke an API key',
    description:
      'Revocation is permanent, you must create another key to continue using the service',
  })
  @ApiOkResponse({ description: 'API key revoked successfully' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({
    description: 'Authenticated user does not own this API key',
  })
  @ApiNotFoundResponse({ description: 'API key not found' })
  @ApiConflictResponse({ description: 'API key is already revoked' })
  @Roles(Role.MERCHANT)
  @Post(':apiKeyId/revoke')
  @HttpCode(HttpStatus.OK)
  async revokeApiKey(
    @Param('merchantId') merchantId: string,
    @Param('apiKeyId') apiKeyId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.apiKeyService.revokeApiKey(apiKeyId, user, merchantId);
  }
}
