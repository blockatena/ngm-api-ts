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
  @ApiProperty()
  cronjob_id: string;
}
export class get_All_Bids {
  @ApiProperty()
  skip: string;
  @ApiProperty()
  limit: string;
  @ApiProperty()
  token_id: string;
  @ApiProperty()
  auction_id: string;
}
