import { ApiProperty } from '@nestjs/swagger';

export class CreateAuctionBody {
  @ApiProperty({ example: '0x2A8b77DF421106C8fCdBE08697c949D519f4c05a' })
  token_owner: string;
  @ApiProperty({ example: '0xE0B8BF7DB5Cd76033f036658De37a06D6C014D9C' })
  contract_address: string;
  @ApiProperty({ example: '3' })
  token_id: number;
  @ApiProperty({ example: '2022-11-01T16:25:00' })
  start_date: string;
  @ApiProperty({ example: '2022-11-01T17:25:00' })
  end_date: string;
  @ApiProperty({ example: 20 })
  min_price: number;
  @ApiProperty()
  sign: string
}
export class CancelAuctionBody {
  @ApiProperty({ example: '0x2A8b77DF421106C8fCdBE08697c949D519f4c05a' })
  contract_address: string;
  @ApiProperty({ example: '3' })
  token_id: number;
  @ApiProperty()
  sign: string
}
export class GetAllBids {
  @ApiProperty()
  skip: string;
  @ApiProperty()
  limit: string;
  @ApiProperty()
  token_id: number;
  @ApiProperty()
  auction_id: string;
}
export class GetAuction {
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: number;
  @ApiProperty()
  end_date: string;
}
export class GetUserNfts {
  @ApiProperty({ default: "0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72" })
  token_owner: string;
  @ApiProperty({ default: 1, minimum: 1 })
  page_number: number;
  @ApiProperty({ default: 5, minimum: 1 })
  items_per_page: number;
}
