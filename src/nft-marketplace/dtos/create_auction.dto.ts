import { ApiProperty } from '@nestjs/swagger';

export class CreateAuctionBody {
  @ApiProperty()
  owner_address: string;
  @ApiProperty()
  token_id: string;
  @ApiProperty({ type: Date })
  start_date: Date;
  @ApiProperty()
  end_date: Date;
  @ApiProperty()
  min_price: number;
}
