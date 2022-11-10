import { ApiProperty } from '@nestjs/swagger';

export class CreateBidBody {
  @ApiProperty()
  bidder_address: string;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: string;
  @ApiProperty()
  bid_amount: number;
  @ApiProperty()
  bid_expires_in: string;
}
export class CancelBidBody {
  @ApiProperty()
  bidder_address: string;
  @ApiProperty()
  token_id: string;
  @ApiProperty()
  contract_address: string;
}
export class Acceptbid {
  @ApiProperty()
  token_owner: string;
  @ApiProperty()
  bidder_address: string;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: string;
}
export class GetBids {
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: string;
}
