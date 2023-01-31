import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NftService } from 'src/nft/nft.service';
import { auctionSchema, AuctionSchema } from 'src/schemas/auction.schema';
import { bidSchema, BidSchema } from 'src/schemas/bid.schema';
import { contractSchema, ContractSchema } from 'src/schemas/contract.schema';
import { nftSchema, NftSchema } from 'src/nft/schema/nft.schema';
import { MetadataController } from './metadata.controller';
import { MetadataService } from './metadata.service';
import { metadata, metadataSchema } from './schema/metadata.schema';
import { nft1155Schema, Nft1155Schema } from 'src/nft/schema/nft.1155.schema';
import { nft1155OwnerSchema, Nft1155OwnerSchema } from 'src/schemas/user-1155.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      {
        name: metadata.name,
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
      { name: Nft1155OwnerSchema.name, schema: nft1155OwnerSchema }
    ]),
  ],
  controllers: [MetadataController],
  providers: [MetadataService, NftService],
})
export class MetadataModule { }
