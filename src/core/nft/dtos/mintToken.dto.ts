import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { type } from 'os';
class Attributes {
  @ApiProperty()
  name: string;
  @ApiProperty()
  value: string;
}

export class MintToken {
  @ApiProperty({ default: 'Api Holder Address' })
  wallet_address: string;
  @ApiProperty({
    description: 'Contract Address of the deployed contract (Battle Field)',
    default: '0x2F9792620f776d5f5231F5f24b5194Ad36967B8a',
  })
  readonly contract_address: string;

  @ApiProperty({
    description: 'Token Owner of the NFT',
    default: '0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72',
  })
  readonly token_owner: string;

  @ApiProperty({
    description:
      'URI of the uploaded image (hint: use /nft/uplo adFile to upload the image and files to IPFS)',
    default:
      'https://nftstorage.link/ipfs/bafybeifx4wknz4psj3nwn6pn7w3tf67srw3ohlbi6iexts6fzbyciebbki/pascal-brandle-rGFQ1_MVkjU-unsplash.jpg',
  })
  readonly image_uri: string;

  @ApiProperty({
    description: 'Name of the NFT',
    default: 'my first nft',
  })
  readonly name: string;

  @ApiProperty({
    description: 'Description of the NFT',
    default: 'This is my newly minted NFT',
  })
  readonly description: string;

  @ApiProperty({ isArray: true, type: Attributes })
  attributes: [Attributes];

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
