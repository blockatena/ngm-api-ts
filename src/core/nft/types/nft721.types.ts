import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

class chainType {
  @ApiProperty({ default: 8001 })
  id: number;
  @ApiProperty({ default: 'Mumbai' })
  name: string;
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

export class GetOwnerResponse {
  @ApiProperty({ default: '0x8f27D09be98d2583E0322C25C8F2149E4AA2635C' })
  contract_address: string;
  @ApiProperty({ default: 31 })
  token_id: number;
  @ApiProperty({ default: '0x000000000000000000000000000000000000dEaD' })
  token_owner: string;
}

class Attributes {
  @ApiProperty({ default: 'score' })
  name: string;
  @ApiProperty({ default: '200' })
  value: string;
}
class MetaData {
  @ApiProperty({ default: 'crypto-chicken-run-game' })
  name: string;
  @ApiProperty({
    default:
      'https://nftstorage.link/ipfs/bafybeihef3pr6kh2yjxdqrur2frw3vzj2nhmhlbkugnmqoqmqcktrhzghe/name1.png',
  })
  image: string;
  @ApiProperty({ default: 'Scored 200' })
  description: string;
  @ApiProperty({ default: 'www.google.com' })
  external_uri: string;
  @ApiProperty({ type: Attributes })
  attributes: [];
}

export class GetSingleNft {
  _id: string;
  @ApiProperty({ default: '0x8f27D09be98d2583E0322C25C8F2149E4AA2635C' })
  contract_address: string;
  @ApiProperty({ default: 'NGMTINY721' })
  contract_type: string;
  @ApiProperty({ default: 31 })
  token_id: number;
  @ApiProperty({ type: chainType })
  chain: chainType;
  @ApiProperty({ default: '2' })
  price: string;
  @ApiProperty({
    default:
      'https://ngm-api-tpnng.ondigitalocean.app/metadata/0x8f27D09be98d2583E0322C25C8F2149E4AA2635C/31',
  })
  meta_data_url: string;
  @ApiProperty({ default: false })
  is_in_auction: boolean;
  @ApiProperty({ default: false })
  is_in_sale: boolean;
  @ApiProperty({ default: '0x000000000000000000000000000000000000dEaD' })
  token_owner: string;
  @ApiProperty({ type: MetaData })
  meta_data: MetaData;
  @ApiProperty({ default: new Date() })
  createdAt: string;
  @ApiProperty({ default: new Date() })
  updatedAt: string;
  __v: 0;
}

export class GetAllNfts {
  @ApiProperty({ default: 5 })
  totalpages: number;
  @ApiProperty({ default: 1 })
  currentPage: number;
  @ApiProperty({ type: GetSingleNft })
  nfts: [];
}
export class GetCollectionResponse {
  @ApiProperty({ type: collection })
  collection: collection;
  @ApiProperty({ default: 122.3 })
  total_volume: number;
  @ApiProperty({ default: 1 })
  floor_price: number;
  @ApiProperty({ default: 2 })
  best_offer: number;
  @ApiProperty({ default: 4 })
  owners: number;
  @ApiProperty({ type: GetSingleNft })
  nfts: [];
}

export class GetSingleNftWithCollection {
  @ApiProperty({ type: collection })
  collection: collection;
  @ApiProperty({ type: GetSingleNft })
  nft: GetSingleNft;
}

//
export class Auction721 {
  @ApiProperty()
  token_owner: string;
  @ApiProperty({ default: '0xf70fc20E629105FA8F07108473329Bf1cB2a6Aaa' })
  contract_address: string;
  @ApiProperty({ default: 8 })
  token_id: number;
  @ApiProperty({ default: '13-12-2022.z787' })
  start_date: Date;
  @ApiProperty({ default: '17-12-2022.z87' })
  end_date: Date;
  @ApiProperty({ default: 0.2 })
  min_price: number;
  @ApiProperty({ default: '13-12-2022.z787' })
  createdAt: Date;
  @ApiProperty({ default: 'started' })
  status: string;
}

export class Bid721 {
  @ApiProperty()
  auction_id: mongoose.Types.ObjectId;
  @ApiProperty()
  bidder_address: string;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: number;
  @ApiProperty()
  bid_amount: number;
  @ApiProperty()
  is_auction_ended: boolean;
  @ApiProperty()
  createdAt: Date;
}

//
export class GetSingleNftWithCollectionAndAuction {
  @ApiProperty({ type: collection })
  collection: collection;
  @ApiProperty({ type: GetSingleNft })
  nft: GetSingleNft;
  @ApiProperty({ type: [Auction721] })
  auction: [Auction721];
  @ApiProperty({ type: [Bid721] })
  bids: [Bid721];
}

export class Sale721 {
  @ApiProperty()
  token_owner: string;
  @ApiProperty({ default: '0xf70fc20E629105FA8F07108473329Bf1cB2a6Aaa' })
  contract_address: string;
  @ApiProperty({ default: 8 })
  token_id: number;
  @ApiProperty({ default: '13-12-2022.z787' })
  start_date: Date;
  @ApiProperty({ default: 0.2 })
  price: number;
  @ApiProperty({ default: '13-12-2022.z787' })
  createdAt: Date;
  @ApiProperty({ default: 'started' })
  status: string;
}

export class Offer721 {
  @ApiProperty()
  sale_id: mongoose.Types.ObjectId;
  @ApiProperty()
  offer_person_address: string;
  @ApiProperty()
  contract_address: string;
  @ApiProperty()
  token_id: number;
  @ApiProperty()
  offer_price: number;
  @ApiProperty()
  offer_status: boolean;
  @ApiProperty()
  createdAt: Date;
}

export class GetSingleNftWithCollectionAndSale {
  @ApiProperty({ type: collection })
  collection: collection;
  @ApiProperty({ type: GetSingleNft })
  nft: GetSingleNft;
  @ApiProperty({ type: [Auction721] })
  sale: [Sale721];
  @ApiProperty({ type: [Bid721] })
  offers: [Offer721];
}

// Auction
export class GetAssetsListedIn {
  @ApiProperty({ enum: ['sale', 'auction'] })
  listed_in: string;
}
