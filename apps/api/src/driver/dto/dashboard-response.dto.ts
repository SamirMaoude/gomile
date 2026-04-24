import { ApiProperty } from '@nestjs/swagger';

export class DashboardResponseDto {
  @ApiProperty({ description: 'True if driver is online' })
  isOnline: boolean;

  @ApiProperty({
    description: 'Aggregation of today total earnings from deliveries',
  })
  todayEarnings: number;

  @ApiProperty({ description: 'Number of succesful deliveries today' })
  todayTrips: number;

  @ApiProperty({ description: 'Last known location of the driver' })
  currentLocation: {
    latitude: number | null;
    longitude: number | null;
  };

  @ApiProperty({ description: 'Coverage radius of the driver' })
  coverageRadiusMeters: number;
}
