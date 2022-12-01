import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  username: string;
  @ApiProperty()
  roles: string;
  @ApiProperty()
  jwt: string;
}

export class GetUser {
  @ApiProperty()
  email: string;
  @ApiProperty()
  wallet_address: string;
}
