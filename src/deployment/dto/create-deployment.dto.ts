import { ApiProperty } from '@nestjs/swagger';
import { RateLimiter } from 'nft.storage';

export class CreateDeploymentDto {
  @ApiProperty({ default: 'NGM-Nft' })
  readonly symbol: string;
  @ApiProperty({
    description: 'Owner of the contract',
    default: '0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72',
  })
  readonly owner_address: string;
  @ApiProperty({ description: 'Role of the player', enum: ['admin', 'user'] })
  readonly roles: any[];
  @ApiProperty({ default: 'Avengers' })
  readonly collection_name: string;
  @ApiProperty({ enum: ["ethereum", "polygon"], default: "ethereum" })
  readonly chain: string;
  @ApiProperty({
    description:
      'Type of contract you want to deploy.We provide 3 options Erc721Psi TinyErc721 Erc1155-D',
    enum: ['Erc721Psi', 'TinyErc721', 'Erc1155-D'],
    default: 'NGM721PSI',
  })
  readonly type: string;
  @ApiProperty({ description: 'Image of the contract for front-end' })
  readonly imageuri?: string;
  @ApiProperty()
  readonly description: string;
  // @ApiProperty()
  readonly limit?: {
    collection_limit: number;
    asset_limit: number;
  };
}
