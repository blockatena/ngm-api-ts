import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNFT {
  @ApiProperty()
  readonly contract_address: string;
  @ApiProperty()
  readonly contract_type: ['NGM721PSI', 'NGM1155', 'NGMTINY721'];
  @ApiProperty()
  readonly token_id: string;
  @ApiProperty()
  readonly description: string;
  @ApiProperty()
  readonly meta_data_url: string;
  @ApiProperty()
  readonly owner_address: string;
}
export class GetNft {
  readonly owner_address: string;
  readonly token_id: string;
}
export class GetCollectionsBody {
  @ApiProperty()
  readonly contract_address: string;
}
export class GetNftBody {
  @ApiProperty()
  readonly contract_address: string;
  @ApiProperty()
  readonly token_id: string;
  @ApiPropertyOptional()
  readonly bids?: boolean;
}
export class Paginate {
  @ApiProperty()
  readonly page_number: number;
  @ApiProperty()
  readonly items_per_page: number;
}

export class NftContractUser {
  @ApiProperty()
  readonly contract_address: string;
  @ApiProperty()
  readonly user_address: string;
}

export class GetListedCollections {
  @ApiProperty()
  contract_address?: string;
  @ApiProperty()
  listed_in?: string;
  @ApiProperty({ default: 1 })
  page_number?: number;
  @ApiProperty({ default: 10 })
  items_per_page?: number;
  @ApiProperty({ enum: ['OldToNew', 'NewToOld'], default: 'NewToOld' })
  order?: string;
  @ApiProperty({ enum: ['AtoZ', 'ZtoA'], default: 'AtoZ' })
  alphabetical_order?: string;
}
export class GetBids {
  @ApiProperty()
  auction_id: string;
}
// Get Single Nft Response
export type GetSingleNftResponse = {
  _id: string;

  contract_address: string;

  contract_type: string;

  token_id: string;

  meta_data_url: string;

  is_in_auction: boolean;
  is_in_sale: boolean;
  token_owner: string;

  __v: string;

  meta_data: {
    name: string;

    image: string;

    description: string;

    external_uri: string;

    attributes: [object];
  };

  createdAt: string;
  updatedAt: string;
};