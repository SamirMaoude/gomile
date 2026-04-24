import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
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
import { KycService } from '../kyc/kyc.service';
import { RejectKycDto } from '../kyc/dto/reject-kyc.dto';

@ApiTags('[Admin]')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly kycService: KycService,
  ) {}

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
}
