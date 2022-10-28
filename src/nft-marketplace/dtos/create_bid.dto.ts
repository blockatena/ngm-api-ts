import { ApiProperty } from '@nestjs/swagger';

export class CreateBidBody {
  @ApiProperty()
  auction_id: string;
  @ApiProperty()
  bidder_address: string;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: string;
  @ApiProperty()
  bid_amount: number;
  @ApiProperty()
  bid_expiresin: string;
}
export class CancelBidBody {
  @ApiProperty()
  bidder_address: string;
  @ApiProperty()
  bid_id: string;
  @ApiProperty()
  token_id: string;
}
export class Acceptbid {
  @ApiProperty()
  auction_id: string;
  @ApiProperty()
  bid_id: string;
}
