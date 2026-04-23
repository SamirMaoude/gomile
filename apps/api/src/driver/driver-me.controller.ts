import {
  HttpCode,
  Post,
  Get,
  Patch,
  Delete,
  Controller,
  Param,
  HttpStatus,
  Body,
  UseGuards,
} from "@nestjs/common";
import {
  ApiOperation,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiTags,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiInternalServerErrorResponse,
  ApiTooManyRequestsResponse,
} from "@nestjs/swagger";
import { Role, VehicleType } from "@prisma/client";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { OrderLivreursService } from "../order/livreurs/order-livreurs.service";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AuthenticatedUser } from "../auth/auth.types";
import { HandshakeDto } from "../order/dto/handshake.dto";
import { DriverMeService } from "./driver-me.service";
import { DriverPositionDto } from "./dto/driver-position.dto";
import { DriverProfileResponseDto } from "./dto/driver-profile-response.dto";
import { UpdateDriverProfileDto } from "./dto/update-driver-profile.dto";
import { SessionVehicleDto } from "./dto/session-vehicle.dto";
import { KycService } from "../kyc/kyc.service";
import { KycStatusResponseDto } from "../kyc/dto/kyc-status-response.dto";
import { DashboardResponseDto } from "./dto/dashboard-response.dto";
import { WithdrawalRequestDto } from "./dto/withdrawal-request.dto";
import { CreateDriverDocumentDto } from "./dto/create-driver-document.dto";

@ApiTags('[Mobile] Driver')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DRIVER)
@Controller('driver/me')
export class DriverMeController {
  constructor(
    private readonly orderLivreursService: OrderLivreursService,
    private readonly driverMeService: DriverMeService,
    private readonly kycService: KycService,
  ) {}

  @ApiOperation({ summary: "Get available missions nearby", description: "Returns orders in SEARCHING_DRIVER status within the driver's delivery radius using PostGIS." })
  @ApiOkResponse({ description: 'List of nearby available missions' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Driver not found' })
  @Get('missions/available')
  @HttpCode(HttpStatus.OK)
  async availableMissions(@CurrentUser() user: AuthenticatedUser) {
    return this.driverMeService.availableOrders(user);
  }

  @ApiOperation({ summary: "Accept an available mission", description: "Atomically claims an order in SEARCHING_DRIVER status. Returns 409 if another driver accepted it first." })
  @ApiOkResponse({ description: 'Mission accepted successfully', schema: { properties: { message: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Mission not found' })
  @ApiConflictResponse({ description: 'Mission was already accepted by another driver' })
  @Post('missions/:missionId/accept')
  @HttpCode(HttpStatus.OK)
  async acceptMission(
    @Param('missionId') missionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderLivreursService.acceptOrder(user, user.id, missionId);
  }

  @ApiOperation({ summary: "Get pickup code (handshake A)", description: "Returns the type A pickup code the driver must show to the merchant. Only available while order is in DRIVER_ACCEPTED status." })
  @ApiOkResponse({ schema: { properties: { pickupCode: { type: 'string', example: '048291' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Mission not found' })
  @ApiConflictResponse({ description: 'Order is no longer in pickup phase' })
  @ApiInternalServerErrorResponse({ description: 'Handshake not found' })
  @Get('missions/:missionId/handshake/pickup-code')
  @HttpCode(HttpStatus.OK)
  async getPickupCode(
    @Param('missionId') missionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderLivreursService.getPickupCode(user, user.id, missionId);
  }

  @ApiOperation({ summary: "Retrieve OTP pickup code for a mission", description: "Allows the driver to retrieve the handshake type A pickup code in case the app was closed. Only available while the mission is in DRIVER_ACCEPTED status." })
  @ApiOkResponse({ schema: { properties: { code: { type: 'string', example: '048291' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Mission not found' })
  @ApiInternalServerErrorResponse({ description: 'Handshake not found, contact backend developer' })
  @Get('missions/:missionId/otp')
  @HttpCode(HttpStatus.OK)
  async getOTP(
    @Param('missionId') missionId: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderLivreursService.getPickupCode(user, user.id, missionId);
  }

  @ApiOperation({ summary: "Pick up a mission (handshake A — merchant code)", description: "Merchant provides driver a code, driver must enter it to validate pick up. 3 attempts allowed." })
  @ApiOkResponse({ description: 'Mission picked up successfully', schema: { properties: { orderId: { type: 'string' }, message: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Mission not found' })
  @ApiConflictResponse({ description: 'Mission already picked up or cancelled' })
  @ApiInternalServerErrorResponse({ description: 'Bad order state' })
  @ApiTooManyRequestsResponse({ description: 'Too many incorrect code attempts (3 allowed)' })
  @Post('missions/:missionId/handshake/merchant/verify')
  @HttpCode(HttpStatus.OK)
  async pickupMission(
    @Param('missionId') missionId: string,
    @Body() dto: HandshakeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderLivreursService.pickupOrder(user, user.id, missionId, dto.code);
  }

  @ApiOperation({ summary: "Deliver a mission (handshake B — customer code)", description: "Customer receives a code, driver must enter it to validate delivery." })
  @ApiOkResponse({ description: 'Mission delivered successfully', schema: { properties: { orderId: { type: 'string' }, message: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Mission not found' })
  @ApiConflictResponse({ description: 'Mission already delivered or cancelled' })
  @ApiInternalServerErrorResponse({ description: 'Bad order state' })
  @ApiTooManyRequestsResponse({ description: 'Too many incorrect code attempts (3 allowed)' })
  @Post('missions/:missionId/handshake/client/verify')
  @HttpCode(HttpStatus.OK)
  async deliverMission(
    @Param('missionId') missionId: string,
    @Body() dto: HandshakeDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.orderLivreursService.deliverOrder(user, user.id, missionId, dto.code);
  }

  @ApiOperation({ summary: "Update driver position", description: "Syncs driver lat/lng and PostGIS location. Should be called frequently while driver is online." })
  @ApiOkResponse({ description: 'Position updated', schema: { properties: { message: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Driver not found' })
  @Patch('location')
  @HttpCode(HttpStatus.OK)
  async updateLocation(
    @Body() dto: DriverPositionDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.driverMeService.updateDriverPosition(user, dto.latitude, dto.longitude);
  }

  @ApiOperation({ summary: "Update driver status", description: "If the driver was available, update the driver status to offline and vice versa. A driver with an ongoing order (busy) cannot change its status." })
  @ApiOkResponse({ description: 'Current status of the driver after the toggle', schema: { properties: { message : { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT'})
  @ApiConflictResponse({ description: 'Driver with ongoing orders cannot change its status'})
  @Patch('availability')
  @HttpCode(HttpStatus.OK)
  async toggleDriverStatus(
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.driverMeService.toggleDriverAvailability(user)
  }

  @ApiOperation({ summary: "Get active missions", description: "Returns missions currently in DRIVER_ACCEPTED or PICKED_UP status." })
  @ApiOkResponse({ description: 'List of active missions' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Driver not found' })
  @Get('missions/active')
  @HttpCode(HttpStatus.OK)
  async getActiveMissions(@CurrentUser() user: AuthenticatedUser) {
    return this.driverMeService.getActiveOrders(user);
  }

  @ApiOperation({ summary: "Get missions history", description: "Returns missions in DELIVERED or CANCELLED status." })
  @ApiOkResponse({ description: 'List of past missions' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Driver not found' })
  @Get('missions/history')
  @HttpCode(HttpStatus.OK)
  async getMissionsHistory(@CurrentUser() user: AuthenticatedUser) {
    return this.driverMeService.getPastOrders(user);
  }

  @ApiOperation({ summary: "Get driver profile" })
  @ApiOkResponse({ type: DriverProfileResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Driver not found' })
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return this.driverMeService.getDriverProfile(user);
  }

  @ApiOperation({ summary: "Update driver profile", description: "Changing address fields will reset KYC status to NOT_SUBMITTED." })
  @ApiOkResponse({ schema: { properties: { message: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Driver not found' })
  @Patch('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Body() dto: UpdateDriverProfileDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.driverMeService.updateDriverProfile(user, dto);
  }

  @ApiOperation({ summary: "Update driver session vehicle "})
  @ApiOkResponse({ schema: { properties: { activeVehicle: {type: 'string', enum: Object.values(VehicleType)}}}})
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Driver not found' })
  @Patch('session-vehicle')
  @HttpCode(HttpStatus.OK)
  async updateSessionVehicle(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: SessionVehicleDto
  ) {
    return this.driverMeService.updateSessionVehicle(user, dto);
  }

  @ApiOperation({ summary: "Get KYC status", description: "Returns the driver's current KYC status, uploaded documents, and latest submission." })
  @ApiOkResponse({ type: KycStatusResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Driver not found' })
  @Get('kyc')
  @HttpCode(HttpStatus.OK)
  async getKycStatus(@CurrentUser() user: AuthenticatedUser) {
    return this.kycService.getMyKycStatus(user.id);
  }

  @ApiOperation({ summary: "Submit for KYC review", description: "Triggers a KYC review request. Driver must have uploaded at least one document first. Sets kycStatus to PENDING." })
  @ApiOkResponse({ schema: { properties: { message: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Driver not found' })
  @ApiConflictResponse({ description: 'A KYC submission is already pending, or no documents uploaded yet' })
  @Post('kyc')
  @HttpCode(HttpStatus.OK)
  async submitKyc(@CurrentUser() user: AuthenticatedUser) {
    return this.kycService.submitKyc(user.id);
  }

  @ApiOperation({ summary: "Retrieve driver dashboard", description: "Driver dashboard contains the primary informations of a driver of the day, including its current status, total earnings, last known location as well as its coverage radius"})
  @ApiOkResponse({type: DashboardResponseDto})
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Driver not found' })
  @Get('dashboard')
  @HttpCode(HttpStatus.OK)
  async getDriverDashboard(
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.driverMeService.getDashboard(user);
  }

  @ApiOperation({ summary: "Get wallet", description: "Returns the driver's wallet balance, currency and pending amount." })
  @ApiOkResponse({ schema: { properties: { 
    balance: { 
      type: 'number' 
    }, 
    currency: { 
      type: 'string' 
    }, 
    pendingAmount: { 
      type: 'number' 
    } 
  } 
} 
})
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Driver not found' })
  @Get('wallet')
  @HttpCode(HttpStatus.OK)
  async getWallet(@CurrentUser() user: AuthenticatedUser) {
    return this.driverMeService.getWallet(user);
  }

  @ApiOperation({ summary: "Get wallet entries", description: "Returns the driver's wallet transaction history." })
  @ApiOkResponse({ schema: { 
    type: 'array', 
    items: { properties: { 
      id: { 
        type: 'string' 
      }, 
      type: { 
        type: 'string' 
      }, 
      amount: { 
        type: 'number' 
      }, 
      status: { 
        type: 'string' 
      }, 
      createdAt: { 
        type: 'string' 
      } 
    } 
  } 
} 
})
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Driver not found' })
  @Get('wallet/entries')
  @HttpCode(HttpStatus.OK)
  async getWalletEntries(@CurrentUser() user: AuthenticatedUser) {
    return this.driverMeService.getWalletEntries(user);
  }

  @ApiOperation({ summary: "Request a withdrawal", description: "Driver requests a withdrawal from their wallet. Amount must be positive and not exceed available balance." })
  @ApiOkResponse({ schema: { properties: { message: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Driver not found' })
  @ApiConflictResponse({ description: 'Insufficient balance or invalid amount' })
  @Post('wallet/withdrawals')
  @HttpCode(HttpStatus.OK)
  async requestWithdrawal(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: WithdrawalRequestDto,
  ) {
    return this.driverMeService.requestWithdrawal(user, dto.amount);
  }

  @ApiOperation({ summary: "List uploaded documents", description: "Returns all typed documents (license, CNI, RIB, etc.) uploaded by the driver." })
  @ApiOkResponse({ schema: { type: 'array', items: { properties: {
    id: { type: 'string' },
    type: { type: 'string' },
    url: { type: 'string' },
    verified: { type: 'boolean' },
    rejectionReason: { type: 'string', nullable: true },
    createdAt: { type: 'string' },
  }}}})
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Driver not found' })
  @Get('documents')
  @HttpCode(HttpStatus.OK)
  async getDocuments(@CurrentUser() user: AuthenticatedUser) {
    return this.driverMeService.getDocuments(user);
  }

  @ApiOperation({ summary: "Upload a document", description: "Stores a typed document (license, CNI, RIB, etc.). Get the URL first via POST /uploads/presign." })
  @ApiOkResponse({ schema: { properties: {
    id: { type: 'string' },
    type: { type: 'string' },
    url: { type: 'string' },
    verified: { type: 'boolean' },
    createdAt: { type: 'string' },
  }}})
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Driver not found' })
  @Post('documents')
  @HttpCode(HttpStatus.OK)
  async uploadDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateDriverDocumentDto,
  ) {
    return this.driverMeService.uploadDocument(user, dto);
  }

  @ApiOperation({ summary: "Delete a document", description: "Deletes the document record and removes the file from S3." })
  @ApiOkResponse({ schema: { properties: { message: { type: 'string' } } } })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT' })
  @ApiNotFoundResponse({ description: 'Document not found or does not belong to driver' })
  @Delete('documents/:documentId')
  @HttpCode(HttpStatus.OK)
  async deleteDocument(
    @CurrentUser() user: AuthenticatedUser,
    @Param('documentId') documentId: string,
  ) {
    return this.driverMeService.deleteDocument(user, documentId);
  }

  
}
