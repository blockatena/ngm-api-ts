import { ApiProperty } from '@nestjs/swagger';

export class createNFT {
  @ApiProperty()
  readonly contract_address: string;
  @ApiProperty()
  readonly contract_type: ['NGM721PSI', 'NGM1155', 'NGMTINY721'];
  @ApiProperty()
  readonly token_id: string;
  @ApiProperty()
  readonly description: string;
  @ApiProperty()
  readonly meta_data_url: string;
  @ApiProperty()
  readonly owner_address: string;
}
export class getNft {
  readonly owner_address: string;
  readonly token_id: string;
}