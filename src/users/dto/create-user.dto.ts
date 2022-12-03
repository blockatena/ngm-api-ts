import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  @ApiProperty()
  email: string;
  @ApiProperty()
  wallet_address: string;
}

export class GetUser {
  @ApiProperty()
  wallet_address: string;
}
