import { Controller, Get, Patch, Param, Body, UseGuards, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiNotFoundResponse, ApiConflictResponse, ApiOperation, ApiTags, ApiForbiddenResponse } from '@nestjs/swagger';
import { MerchantService } from './merchant.service';
import { UpdateMerchantDto } from './dto/update-merchant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/auth.types';
import { createApiError } from '../common/api-error';
import { MERCHANT_ERRORS } from './merchant-errors';

@ApiTags('[Web][Merchant]')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.MERCHANT)
@Controller('merchants/:merchantId')
export class MerchantController {
  constructor(private merchantService: MerchantService) {}

  @ApiOperation({ summary: 'Get merchant profile' })
  @ApiOkResponse({ description: 'Merchant profile' })
  @ApiNotFoundResponse({ description: 'Merchant not found' })
  @Get()
  @HttpCode(HttpStatus.OK)
  getProfile(@Param('merchantId') merchantId: string) {
    return this.merchantService.getMerchant(merchantId);
  }

  @ApiOperation({ summary: 'Update merchant name or phone number' })
  @ApiBody({ type: UpdateMerchantDto })
  @ApiOkResponse({ description: 'Merchant updated' })
  @ApiNotFoundResponse({ description: 'Merchant not found' })
  @ApiConflictResponse({ description: 'Phone number already in use' })
  @ApiForbiddenResponse({ description: 'Not your account' })
  @Patch()
  @HttpCode(HttpStatus.OK)
  update(
    @Param('merchantId') merchantId: string,
    @Body() dto: UpdateMerchantDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    if (user.id !== merchantId) {
      throw new ForbiddenException(createApiError('MERCHANT_NOT_FOUND', MERCHANT_ERRORS));
    }
    return this.merchantService.updateMerchant(merchantId, dto);
  }
}
