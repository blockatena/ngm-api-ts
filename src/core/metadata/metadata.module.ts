import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MetadataController } from './metadata.controller';
import { MetadataService } from './metadata.service';
import { MetadataSchema, metadataSchema } from './schema/metadata.schema';
import {
  ContractSchema,
  contractSchema,
} from '../deployment/schema/contract.schema';
import {
  AuctionSchema,
  auctionSchema,
} from '../marketplace/schema/auction.schema';
import { BidSchema, bidSchema } from '../marketplace/schema/bid.schema';
import { NftService } from '../nft/nft.service';
import { Nft1155Schema, nft1155Schema } from '../nft/schema/nft.1155.schema';
import { NftSchema, nftSchema } from '../nft/schema/nft.schema';
import {
  Nft1155OwnerSchema,
  nft1155OwnerSchema,
} from '../nft/schema/user1155.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      {
        name: MetadataSchema.name,
        schema: metadataSchema,
      },
      {
        name: NftSchema.name,
        schema: nftSchema,
      },
      {
        name: ContractSchema.name,
        schema: contractSchema,
      },
      { name: AuctionSchema.name, schema: auctionSchema },
      { name: BidSchema.name, schema: bidSchema },
      { name: Nft1155Schema.name, schema: nft1155Schema },
      { name: Nft1155OwnerSchema.name, schema: nft1155OwnerSchema },
    ]),
  ],
  controllers: [MetadataController],
  providers: [MetadataService, NftService],
})
export class MetadataModule {}
