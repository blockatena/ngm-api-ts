import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNFT {
  @ApiProperty()
  readonly contract_address: string;
  @ApiProperty()
  readonly contract_type: ['NGM721PSI', 'NGM1155', 'NGMTINY721'];
  @ApiProperty()
  readonly token_id: number;
  @ApiProperty()
  readonly description: string;
  @ApiProperty()
  readonly meta_data_url: string;
  @ApiProperty()
  readonly owner_address: string;
}
export class GetNft {
  readonly owner_address: string;
  readonly token_id: number;
}
export class GetCollectionsBody {
  @ApiProperty({ default: '0xc5195CDa9ED7dC18AFA7b69Da90Bbaf427C1ca3F' })
  readonly contract_address: string;
}
export class GetNftBody {
  @ApiProperty({ default: '0xc5195CDa9ED7dC18AFA7b69Da90Bbaf427C1ca3F' })
  readonly contract_address: string;
  @ApiProperty({ default: 1 })
  readonly token_id: number;
}
export class Paginate {
  @ApiProperty({ default: 1 })
  page_number: number;
  @ApiProperty({ default: 10 })
  items_per_page: number;
  // @ApiProperty({ enum: ["NOTREQUIRED", "NEWTOOLD", "OLDTONEW"], required: false })
  // sort_by_date: string;
  // @ApiProperty({ enum: ["NOTREQUIRED", "ATOZ", "ZTOA"], required: false })
  // sort_by_names: string;
  @ApiProperty({ enum: ["NA", "NEWTOOLD", "OLDTONEW", "ATOZ", "ZTOA"], default: "NA" })
  sort_by:string;
  @ApiProperty({enum:["NA","AUCTION", "SALE"], default:"NA"})
  listed_in:string
}

export class NftContractUser {
  @ApiProperty({ default: '0x8f27D09be98d2583E0322C25C8F2149E4AA2635C', description: 'contract address of the Collection' })
  readonly contract_address: string;
  @ApiProperty({ default: '0x952450E079AFBb4f75b1F0Ed94120e6573623bC1', description: 'wallet address of the user' })
  readonly user_address: string;
}

export class GetListedCollections {
  @ApiProperty({ default: '0x8f27D09be98d2583E0322C25C8F2149E4AA2635C' },)
  contract_address?: string;
  @ApiProperty({ default: '0x952450E079AFBb4f75b1F0Ed94120e6573623bC1' })
  token_owner?: string;
  @ApiProperty({ enum: ['auction', 'sale'], default: 'auction' })
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

  token_id: number;

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
