import { ApiProperty } from '@nestjs/swagger';
import { DriverStatus, VehicleType } from '@prisma/client';

export class DriverProfileResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ example: 'Jean' })
  firstName: string;

  @ApiProperty({ example: 'Dupont' })
  lastName: string;

  @ApiProperty({
    example: 'https://storage.example.com/avatar.jpg',
    nullable: true,
  })
  avatarUrl: string | null;

  @ApiProperty({ example: 'jean@mail.com' })
  email: string;

  @ApiProperty({ example: '+33612345678', nullable: true })
  phone: string | null;

  @ApiProperty({ example: 4.9, nullable: true })
  rating: number | null;

  @ApiProperty({ example: 128 })
  totalTrips: number;

  @ApiProperty({ enum: VehicleType, nullable: true, example: VehicleType.BIKE })
  activeVehicle: VehicleType | null;

  @ApiProperty({ example: 'GM-A1B2C3-2026' })
  gomileCode: string;

  @ApiProperty({ enum: DriverStatus, example: DriverStatus.AVAILABLE })
  status: DriverStatus;
}
