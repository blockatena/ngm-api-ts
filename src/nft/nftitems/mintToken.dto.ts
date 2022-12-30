import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
export class MintToken {

  @ApiProperty({
    description: 'Contract Address of the deployed contract (Battle Field)',
    example: '0x2F9792620f776d5f5231F5f24b5194Ad36967B8a',
  })
  readonly contract_address: string;

  @ApiProperty({
    description: 'Token Owner of the NFT',
    example: '0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72',
  })
  readonly token_owner: string;

  @ApiProperty({
    description:
      'Number of tokens for ERC1155 type contract (optional for ERC721 type contracts)',
    example: '1',
  })
  readonly number_of_tokens?: number;

  @ApiProperty({
    description:
      'URI of the uploaded image (hint: use /nft/uplo adFile to upload the image and files to IPFS)',
    example:
      'https://nftstorage.link/ipfs/bafybeifx4wknz4psj3nwn6pn7w3tf67srw3ohlbi6iexts6fzbyciebbki/pascal-brandle-rGFQ1_MVkjU-unsplash.jpg',
  })
  readonly image_uri: string;

  @ApiProperty({
    description: 'Name of the NFT',
    example: 'my first nft',
  })
  readonly name: string;

  @ApiProperty({
    description: 'Description of the NFT',
    example: 'This is my newly minted NFT',
  })
  readonly description: string;

  @ApiProperty({
    description: 'attributes of the nft',
    example: "[{name: 'name', value: 'value'}]",
  })
  readonly attributes: any[];

  @ApiProperty({
    description:
      'External url for the NFT (optional) for game developers to add extra details or info, else just pass "" empty string',
    example: 'https://google.com',
  })
  readonly external_uri: string;

  readonly limit?: number;
}

@ApiExtraModels()
export class transactions {
  @ApiProperty()
  readonly 'token-id': string;

  @ApiProperty()
  readonly 'cntr-addr': string;
}
