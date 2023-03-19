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
  @ApiProperty({ example: '0x2A8b77DF421106C8fCdBE08697c949D519f4c05a' })
  wallet_address: string;
}

export class UpdateUser {
  @ApiProperty()
  wallet_address: string;
  @ApiProperty()
  username: string;
}
