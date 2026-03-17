import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { AUTH_MESSAGES } from '../auth-messages';

export class AuthenticatedUserDto {
  @ApiProperty({
    format: 'uuid',
    example: '0f7b36cf-b12a-4d2b-9cb5-6d4d7f934112',
  })
  id: string;

  @ApiProperty({ example: 'merchant@test.local' })
  email: string;

  @ApiProperty({ enum: Role, example: Role.MERCHANT })
  role: Role;
}

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access.signature',
  })
  accessToken: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh.signature',
  })
  refreshToken: string;

  @ApiProperty({ type: AuthenticatedUserDto })
  user: AuthenticatedUserDto;
}

export class LogoutResponseDto {
  @ApiProperty({ example: AUTH_MESSAGES.LOGOUT_SUCCESS })
  message: string;
}
