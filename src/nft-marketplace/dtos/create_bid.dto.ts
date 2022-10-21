import { ApiProperty } from '@nestjs/swagger';

export class CreateBidBody {
  @ApiProperty()
  auction_id: string;
  @ApiProperty()
  bidder_address: string;
  @ApiProperty()
  token_id: string;
  @ApiProperty()
  bid_amount: number;
  @ApiProperty()
  bid_expiresin: string;
}
