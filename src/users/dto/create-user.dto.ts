import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  username: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  wallet_address: string;
}

export class UserPic {
  @ApiProperty()
  wallet_address: string;
  @ApiProperty({ enum: ['profile', 'banner'] })
  type: string;
}


export class GetUser {
  @ApiPropertyOptional()
  wallet_address?: string
  @ApiPropertyOptional()
  email?: string;
  @ApiPropertyOptional()
  username?: string;
}

export class UpdateUser {
  @ApiProperty()
  wallet_address: string;
  @ApiProperty()
  username: string;
}