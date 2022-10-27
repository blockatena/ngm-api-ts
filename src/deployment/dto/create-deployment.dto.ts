import { ApiProperty } from '@nestjs/swagger';

export class CreateDeploymentDto {
  @ApiProperty({ default: 'NGM-Nft' })
  readonly symbol: string;
  @ApiProperty({
    description: 'Owner of the contract',
    default: '0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72',
  })
  readonly ownerAddress: string;
  @ApiProperty({ description: 'Role of the player', enum: ['admin', 'user'] })
  readonly roles: any[];
  @ApiProperty({ default: 'Avengers' })
  readonly collectionName: string;
  @ApiProperty({ default: 'polygon' })
  readonly chain: string;
  @ApiProperty({
    description:
      'Type of contract you want to deploy.We provide 3 options Erc721Psi TinyErc721 Erc1155-D',
    examples: ['Erc721Psi', 'TinyErc721', 'Erc1155-D'],
    default: 'NGM721PSI',
  })
  readonly type: string;
  @ApiProperty({ description: 'Image of the contract for front-end' })
  readonly imageuri?: string;
}
