import { ApiProperty } from '@nestjs/swagger';
import { VehicleType } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class SessionVehicleDto {
  @ApiProperty({
    description: 'Vehicle type',
    enum: VehicleType,
    example: VehicleType.BIKE,
  })
  @IsEnum(VehicleType)
  vehicleType: VehicleType;
}
