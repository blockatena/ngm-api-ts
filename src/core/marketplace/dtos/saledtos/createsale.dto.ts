import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleBody {
  @ApiProperty()
  token_owner: string;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: number;
  @ApiProperty()
  price: string;
  @ApiProperty()
  start_date: Date;
  @ApiProperty()
  end_date: string;
  @ApiProperty()
  sign: string;
}
export class CancelSaleBody {
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: number;
  @ApiProperty()
  sign: string;
}
