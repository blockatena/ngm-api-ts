import { ApiProperty } from '@nestjs/swagger';

export class Create_Sale_Body {
  @ApiProperty()
  token_owner: string;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: string;
  @ApiProperty()
  price: string;
  @ApiProperty()
  start_date: Date;
  @ApiProperty()
  end_date: string;
}
