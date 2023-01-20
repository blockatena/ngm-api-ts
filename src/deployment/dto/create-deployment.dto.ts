import { ApiProperty } from '@nestjs/swagger';
import { RateLimiter } from 'nft.storage';

export class CreateDeploymentDto {
  @ApiProperty({ example: 'GTW3', required:false })
  readonly symbol: string;
  @ApiProperty({
    description: 'Owner of the contract',
    example: '0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72',
    required:false
  })
  readonly owner_address: string;
  @ApiProperty({ description: 'Role of the player', enum: ['admin', 'user'] ,  required:false})
  readonly roles: any[];
  @ApiProperty({ example: 'Avengers',  required:false })
  readonly collection_name: string;
  @ApiProperty({ enum: ["ethereum", "polygon"], example: "ethereum",  required:false })
  readonly chain: string;
  @ApiProperty({
    description:
      'Type of contract you want to deploy.We provide 3 options Erc721Psi TinyErc721 Erc1155-D',
    enum: ['ERC721PSI', 'TINYERC721', 'ERC1155-D'],
    example: 'NGM721PSI',
     required:false
  })
  readonly type: string;
  @ApiProperty({ description: 'Image of the contract for front-end', example:'https://nftstorage.link/ipfs/bafybeibsjmjiic7kmwm6xjwzy4gbhgb5nk3vxt4tnmbyr2zbhx5lm5g77u/ghost.jpg',  required:false })
  readonly imageuri?: string;
  @ApiProperty({example: 'description of the collection',  required:false})
  readonly description: string;
  // @ApiProperty()
  readonly limit?: {
    collection_limit: number;
    asset_limit: number;
  };
}


export class getContractInfo {
  @ApiProperty({default:'0x5Eb7D2414e19E730A61aBB897793F0E8406f0F05'})
  contract_address:string
}

class Chain {
    @ApiProperty({default:80001})
    id:number
    @ApiProperty({default:'network'})
    name:string
}
export class getCollection {
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