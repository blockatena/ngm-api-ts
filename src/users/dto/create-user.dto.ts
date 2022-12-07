import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  username: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  wallet_address: string;
}

export class GetUser {
  @ApiPropertyOptional()
  wallet_address?: string
  @ApiPropertyOptional()
  email?: string;
  @ApiPropertyOptional()
  username?: string;
}