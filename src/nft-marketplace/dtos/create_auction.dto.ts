import { ApiProperty } from '@nestjs/swagger';

export class CreateAuctionBody {
  @ApiProperty()
  token_owner: string;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: string;
  @ApiProperty({ type: Date })
  start_date: Date;
  @ApiProperty()
  end_date: Date;
  @ApiProperty()
  min_price: number;
}
export class CancelAuctionBody {
  @ApiProperty()
  auction_id: string;
}
