import { ApiProperty } from "@nestjs/swagger"

import { type } from "os";


class Attributes {
    @ApiProperty({ default: "score" })
    name: string;
    @ApiProperty({ default: "200" })
    value: string
}
class MetaData {

    @ApiProperty()

    name: string;
    @ApiProperty({default:'imageuri'})
    image: string;
    @ApiProperty({default:'This is a game nft'})
    description: string;
    @ApiProperty({ default: "https://www.google.com" })
    external_uri: string;
    @ApiProperty({})
    attributes: [];
}


export class GetSingleNft {
    @ApiProperty({})
    _id: string;
    @ApiProperty({default:'0x31b9879FC5853C22487b99Bf97B1Bf48eAeA88d2'})
    contract_address: string;
    @ApiProperty({default:'NGM721PSI'})
    contract_type: string;
    @ApiProperty({default:'0'})
    token_id: number;
    @ApiProperty({})
    price: string;
    @ApiProperty({})
    meta_data_url: string;
    @ApiProperty({})
    is_in_auction: boolean;
    @ApiProperty({})
    is_in_sale: boolean;
    @ApiProperty({})
    token_owner: string;
    @ApiProperty({})
    meta_data: MetaData
    @ApiProperty({})
    createdAt: string;
    @ApiProperty({})
    updatedAt: string;
    __v: 0
}

export class GetAllNfts {
    @ApiProperty({default:1, minimum:1})
    totalpages: number;
    @ApiProperty({default:5})
    currentPage: number;
    @ApiProperty({ type: GetSingleNft })
    nfts: [];
}

export class getAllNfts {
    @ApiProperty({})
    total_nfts:number
    @ApiProperty({default:1, minimum:1})
    totalpages: number;
    @ApiProperty({default:5})
    currentPage: number;
    @ApiProperty({ type: GetSingleNft })
    nfts: [];
}
export class getListedNFts {
    @ApiProperty({enum:['auction', 'sale'], default:'auction'})
    listed_in:string
}


class Chain {
    @ApiProperty({default:80001})
    id:number
    @ApiProperty({default:'network'})
    name:string
}
class getCollection {
    @ApiProperty({})
    symbol: string
    @ApiProperty({})
    owner_address: string
    @ApiProperty({})
    collection_name: string
    @ApiProperty({})
    chain: Chain
    @ApiProperty({})
    type: string
    @ApiProperty({})
    transactionhash: string
    @ApiProperty({})
    contract_address: string
    @ApiProperty({})
    description:string
    @ApiProperty({})
    baseuri: string
    @ApiProperty({})
    imageuri: string[]
    @ApiProperty({})
    trade_volume: string
    @ApiProperty({})
    createdAt: string
    @ApiProperty({})
    updatedAt: string
    }

export class GetAllCollections {
    @ApiProperty({required:true})
    total:number
    @ApiProperty({default:1,minimum:1})
    current_page:string
    @ApiProperty({default:5})
    items_per_page: string
    @ApiProperty({type:getCollection})
    collections:[];
}

export class getAsset {
    @ApiProperty({})
    contract_detail:getCollection
    @ApiProperty({})
    nft:GetSingleNft
    @ApiProperty({})
    token_owner_info:string
}

export class getAllCollections {
    @ApiProperty({})
    total_collections:number
    @ApiProperty({default:1})
    total_pages: number
    @ApiProperty({default:1,minimum:1})
    current_page:string
    @ApiProperty({default:5})
    items_per_page: string
    @ApiProperty({type:getCollection})
    collections:[];
}

export class GetSingleCollection {
    @ApiProperty({})
    collection:getCollection
    @ApiProperty({type:GetSingleNft})
    nfts:[]
}

export class getTokenBalance {
    @ApiProperty({})
    quantity:number
}