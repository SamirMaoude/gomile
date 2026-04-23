import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, ValidateIf } from 'class-validator';

export class DriverPositionDto {
  @ApiProperty({ description: 'Last known latitude of the driver' })
  @IsNumber()
  @IsNotEmpty()
  @ValidateIf((o: DriverPositionDto) => o.longitude !== undefined)
  latitude: number;

  @ApiProperty({ description: 'Last known longitude' })
  @IsNumber()
  @IsNotEmpty()
  @ValidateIf((o: DriverPositionDto) => o.latitude !== undefined)
  longitude: number;
}
