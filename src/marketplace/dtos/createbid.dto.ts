import { ApiProperty } from '@nestjs/swagger';

export class CreateBidBody {
  @ApiProperty()
  bidder_address: string;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: number;
  @ApiProperty()
  bid_amount: number;
  @ApiProperty()
  sign: string
  // @ApiProperty()
  // bid_expires_in: string;
}
export class CancelBidBody {
  @ApiProperty()
  bidder_address: string;
  @ApiProperty()
  token_id: number;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  sign: string
}
export class Acceptbid {
  @ApiProperty()
  auction_id: string;
  @ApiProperty()
  sign: string
}
export class GetBids {
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: number;
}

export class updateAllBidsBody {
  contract_address: string;
  token_id: number;
  status: string;
}
