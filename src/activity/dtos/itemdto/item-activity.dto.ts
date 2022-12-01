import { ApiProperty } from '@nestjs/swagger';

export class GetItemActivity {
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: string;
}