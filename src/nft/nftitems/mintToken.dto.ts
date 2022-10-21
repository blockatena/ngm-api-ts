import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';

@ApiExtraModels()
export class mintToken {
  @ApiProperty({
    description: 'Contract Address of the deployed contract',
    example: '44fdfsdfdsfsfsdgssd',
  })
  readonly contract_address: string;
  @ApiProperty({
    description: 'Token ID of the NFT',
    example: 'dfsed454fdfsdfdsfsfsdgssd',
  })
  readonly token_owner: string;
  @ApiProperty({
    description:
      'Number of tokens for ERC1155 type contract (optional for ERC721 type contracts)',
    example: '4',
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
    example: "[{name: 'name', value: 'value']]",
  })
  readonly attributes: any[];
  @ApiProperty({
    description:
      'External url for the NFT (optional) for game developers to add extra details or info, else just pass "" empty string',
    example: 'https://google.com',
  })
  readonly external_uri: string;
}

@ApiExtraModels()
export class transactions {
  @ApiProperty()
  readonly 'token-id': string;

  @ApiProperty()
  readonly 'cntr-addr': string;
}
