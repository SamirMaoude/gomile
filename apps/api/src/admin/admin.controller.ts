import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AdminService } from './admin.service';
import { UpdateWithdrawalDto } from './dto/update-withdrawal.dto';
import { CreateAdminAccountDto } from './dto/create-admin-account.dto';
import { KycService } from '../kyc/kyc.service';
import { RejectKycDto } from '../kyc/dto/reject-kyc.dto';
import { AuthService } from '../auth/auth.service';
import { RegisterMerchantDto } from '../auth/dto/register-merchant.dto';
import { RegisterDriverDto } from '../auth/dto/register-driver.dto';

@ApiTags('[Admin]')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly kycService: KycService,
    private readonly authService: AuthService,
  ) {}

  @ApiOperation({ summary: 'Create an admin account' })
  @ApiOkResponse({ schema: { properties: { message: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiConflictResponse({ description: 'Email already in use' })
  @Post('accounts/admin')
  @HttpCode(HttpStatus.CREATED)
  async createAdminAccount(@Body() dto: CreateAdminAccountDto) {
    return this.authService.registerAdmin(dto.email, dto.password);
  }

  @ApiOperation({ summary: 'Create a merchant account' })
  @ApiOkResponse({ schema: { properties: { message: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiConflictResponse({ description: 'Email or phone already in use' })
  @Post('accounts/merchant')
  @HttpCode(HttpStatus.CREATED)
  async createMerchantAccount(@Body() dto: RegisterMerchantDto) {
    await this.authService.registerMerchant(dto);
    return { message: 'Merchant account created. A verification email has been sent.' };
  }

  @ApiOperation({ summary: 'Create a driver account' })
  @ApiOkResponse({ schema: { properties: { message: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiConflictResponse({ description: 'Email or phone already in use' })
  @Post('accounts/driver')
  @HttpCode(HttpStatus.CREATED)
  async createDriverAccount(@Body() dto: RegisterDriverDto) {
    await this.authService.registerDriver(dto);
    return { message: 'Driver account created. A verification email has been sent.' };
  }

  @ApiOperation({
    summary: 'List all drivers',
    description:
      'Returns all registered drivers with their KYC status and latest submission.',
  })
  @ApiOkResponse({ description: 'List of all drivers' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @Get('drivers')
  @HttpCode(HttpStatus.OK)
  async getAllDrivers() {
    return this.adminService.getAllDrivers();
  }

  @ApiOperation({
    summary: 'Get a driver by ID',
    description:
      'Returns full driver profile including documents, KYC submissions and wallet balance.',
  })
  @ApiOkResponse({ description: 'Driver detail' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @Get('drivers/:driverId')
  @HttpCode(HttpStatus.OK)
  async getDriver(@Param('driverId') driverId: string) {
    return this.adminService.getDriver(driverId);
  }

  @ApiOperation({
    summary: 'List withdrawal requests',
    description:
      'Returns driver withdrawal requests. Filter by status: PENDING, COMPLETED, CANCELLED.',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['PENDING', 'COMPLETED', 'CANCELLED'],
  })
  @ApiOkResponse({ description: 'List of withdrawal requests' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @Get('withdrawals')
  @HttpCode(HttpStatus.OK)
  async getWithdrawals(
    @Query('status') status?: 'PENDING' | 'COMPLETED' | 'CANCELLED',
  ) {
    return this.adminService.getWithdrawals(status);
  }

  @ApiOperation({
    summary: 'Approve or cancel a withdrawal',
    description:
      'Set withdrawal status to COMPLETED or CANCELLED. Cancelling refunds the balance to the driver.',
  })
  @ApiOkResponse({ description: 'Withdrawal updated' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiNotFoundResponse({ description: 'Withdrawal not found' })
  @ApiConflictResponse({ description: 'Withdrawal already processed' })
  @Patch('withdrawals/:withdrawalId')
  @HttpCode(HttpStatus.OK)
  async updateWithdrawal(
    @Param('withdrawalId') withdrawalId: string,
    @Body() dto: UpdateWithdrawalDto,
  ) {
    return this.adminService.updateWithdrawal(withdrawalId, dto.status);
  }

  @ApiOperation({ summary: 'Approve a driver KYC submission' })
  @ApiOkResponse({ schema: { properties: { message: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiNotFoundResponse({ description: 'Driver or KYC submission not found' })
  @Put('drivers/:driverId/kyc/approve')
  @HttpCode(HttpStatus.OK)
  async approveKyc(@Param('driverId') driverId: string) {
    return this.kycService.approveDriverKyc(driverId);
  }

  @ApiOperation({ summary: 'Reject a driver KYC submission' })
  @ApiOkResponse({ schema: { properties: { message: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiNotFoundResponse({ description: 'Driver or KYC submission not found' })
  @Put('drivers/:driverId/kyc/reject')
  @HttpCode(HttpStatus.OK)
  async rejectKyc(
    @Param('driverId') driverId: string,
    @Body() dto: RejectKycDto,
  ) {
    return this.kycService.rejectDriverKyc(driverId, dto.rejectionReason);
  }

  @ApiOperation({ summary: 'Resetting handshake attempts', description: 'This action will reset the remaining handshake attempts to 3 on both merchant and client side'})
  @ApiOkResponse({ schema: { properties: { message: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiForbiddenResponse({ description: 'Admin role required' })
  @ApiNotFoundResponse({ description: 'Order not found' })
  @Post('orders/:orderId/reset')
  @HttpCode(HttpStatus.OK)
  async resetHandshake(
    @Param('orderId') orderId: string,
  ) {
    return this.adminService.unlockHandshake(orderId)
  }

}
