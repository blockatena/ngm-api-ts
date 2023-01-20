import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNFT {
  @ApiProperty({default:'0x31b9879FC5853C22487b99Bf97B1Bf48eAeA88d2'})
  readonly contract_address: string;
  @ApiProperty({default:'NGM721PSI'})
  readonly contract_type: ['NGM721PSI', 'NGM1155', 'NGMTINY721'];
  @ApiProperty({default:'1'})
  readonly token_id: string;
  @ApiProperty({default:'Description of the NFT'})
  readonly description: string;
  @ApiProperty({default:'https://ngm-api-tpnng.ondigitalocean.app/metadata/0x31b9879FC5853C22487b99Bf97B1Bf48eAeA88d2/1'})
  readonly meta_data_url: string;
  @ApiProperty({default:'0x2A8b77DF421106C8fCdBE08697c949D519f4c05a'})
  readonly owner_address: string;
}
export class GetNft {
  readonly owner_address: string;
  readonly token_id: string;
}
export class GetCollectionsBody {
  @ApiProperty({ default: '0xc5195CDa9ED7dC18AFA7b69Da90Bbaf427C1ca3F' })
  readonly contract_address: string;
}
export class GetNftBody {
  @ApiProperty({ default: '0xc5195CDa9ED7dC18AFA7b69Da90Bbaf427C1ca3F' })
  readonly contract_address: string;
  @ApiProperty({ default: '1' })
  readonly token_id: string;
}
export class Paginate {
  @ApiProperty({ default: 1 })
  readonly page_number: number;
  @ApiProperty({ default: 10 })
  readonly items_per_page: number;
}

export class NftContractUser {
  @ApiProperty({ default: '0xc5195CDa9ED7dC18AFA7b69Da90Bbaf427C1ca3F' })
  readonly contract_address: string;
  @ApiProperty({default:'0x2A8b77DF421106C8fCdBE08697c949D519f4c05a'})
  readonly user_address: string;
}

export class GetListedCollections {
  @ApiProperty({default:'0x31b9879FC5853C22487b99Bf97B1Bf48eAeA88d2', required:false})
  contract_address?: string;
  @ApiProperty({default:'0x2A8b77DF421106C8fCdBE08697c949D519f4c05a',required:false})
  token_owner?: string;
  @ApiProperty({enum: ['auction', 'sale'],default:'auction',required:false})
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
