import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export class GetNft1155 {
  @ApiProperty({ default: '0x68e24E30348cACcB8dF3d62Fa2891B4864ff0879' })
  contract_address: string;
  @ApiProperty({ default: 0 })
  token_id: number;
}

export class GetTokensUserHold {
  @ApiProperty({ default: '0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72' })
  token_owner: string;
  @ApiProperty({ default: '0x68e24E30348cACcB8dF3d62Fa2891B4864ff0879' })
  contract_address: string;
  @ApiProperty({ default: 0 })
  token_id: number;
}

export class GetTokensUserHoldResponse {
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: number;
  @ApiProperty()
  token_owner: string;
  @ApiProperty()
  number_of_tokens: number;
}

export class GetAssetByUser {
  @ApiProperty()
  token_owner: string;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: number;
}

export class get1155nft {
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: number;
  @ApiProperty()
  token_owner: string;
}
// Responses
class chainType {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
}
class attributes {
  @ApiProperty()
  name: string;
  @ApiProperty()
  value: number;
}
class metadata {
  @ApiProperty()
  name: string;
  @ApiProperty()
  image: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  external_uri: string;
  @ApiProperty()
  attributes: [attributes];
}
export class Get1155AssetOwner {
  _id: mongoose.Types.ObjectId;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: number;
  @ApiProperty()
  chain: chainType;
  @ApiProperty()
  token_owner: string;
  @ApiProperty()
  number_of_tokens: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  __v: number;
}

export class get1155Asset {
  _id: mongoose.Types.ObjectId;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  contract_type: string;
  @ApiProperty()
  chain: chainType;
  @ApiProperty()
  token_id: number;
  @ApiProperty()
  @ApiProperty()
  number_of_tokens: number;
  @ApiProperty()
  listed_tokens: number;
  @ApiProperty()
  price: number;
  @ApiProperty()
  meta_data_url: string;
  @ApiProperty()
  is_in_auction: boolean;
  @ApiProperty()
  is_in_sale: boolean;
  @ApiProperty()
  meta_data: metadata;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  __v: number;
}

export class Get1155NewlyMintedResponse {
  @ApiProperty()
  data: get1155Asset;
  @ApiProperty()
  user_1155: Get1155AssetOwner;
}
export class get1155AssetsByCollectionResponse {
  @ApiProperty()
  unique_owners: number;
  @ApiProperty()
  get_nfts: [get1155Asset];
}

export class GetUserHoldTokensResponse {
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: number;
  @ApiProperty()
  owner_address: string;
  @ApiProperty()
  balance: number;
}

export class collection {
  _id: mongoose.Types.ObjectId;
  @ApiProperty()
  symbol: string;
  @ApiProperty()
  owner_address: string;
  @ApiProperty()
  collection_name: string;
  @ApiProperty()
  chain: chainType;
  @ApiProperty()
  type: string;
  @ApiProperty()
  transactionhash: string;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  description: string;
  @ApiProperty()
  baseuri: string;
  @ApiProperty()
  imageuri: [string];
  @ApiProperty()
  trade_volume: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  __v: number;
}

class GetSale {
  _id: mongoose.Types.ObjectId;
  @ApiProperty()
  token_owner: string;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: number;
  @ApiProperty()
  number_of_tokens: number;
  @ApiProperty()
  start_date: Date;
  @ApiProperty()
  end_date: Date;
  @ApiProperty()
  per_unit_price: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  status: string;
  __v: number;
}
class GetOffer {
  _id: mongoose.Types.ObjectId;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: number;
  @ApiProperty()
  number_of_tokens: number;
  @ApiProperty()
  per_unit_price: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  status: string;
  __v: number;
}

export class GetSingle1155Nft {
  @ApiProperty()
  contract_details: collection;
  @ApiProperty()
  nft: get1155Asset;
  @ApiProperty()
  owners: [Get1155AssetOwner];
  @ApiProperty()
  offers: [GetOffer];
  @ApiProperty()
  sales: [GetSale];
}

export class GetUserOwned1155Assets {
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: number;
  @ApiProperty()
  chain: chainType;
  @ApiProperty()
  token_owner: string;
  @ApiProperty()
  number_of_tokens: number;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty({ type: metadata })
  meta_data: metadata;
}
