import { HttpModule } from '@nestjs/axios';
import { NftController721 } from './nft721.controller';
import { NftController1155 } from './nft1155.controller';
import { NftService } from './nft.service';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityModule } from 'src/activity/activity.module';
import { nft1155Schema, Nft1155Schema } from './schema/nft.1155.schema';
import { CommonModule } from 'src/common/common.module';
import { NftMintController } from './nft.mint.controller';
import { DeploymentModule } from '../deployment/deployment.module';
import {
  ContractSchema,
  contractSchema,
} from '../deployment/schema/contract.schema';
import { NftMarketplaceModule } from '../marketplace/marketplace.module';
import {
  AuctionSchema,
  auctionSchema,
} from '../marketplace/schema/auction.schema';
import { BidSchema, bidSchema } from '../marketplace/schema/bid.schema';
import { NftSchema, nftSchema } from './schema/nft.schema';
import {
  Nft1155OwnerSchema,
  nft1155OwnerSchema,
} from './schema/user1155.schema';
import {
  metadataSchema,
  MetadataSchema,
} from '../metadata/schema/metadata.schema';
import { UsersModule } from '../users/users.module';

require('dotenv').config();
@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => NftMarketplaceModule),
    forwardRef(() => CommonModule),
    ActivityModule,
    DeploymentModule,
    HttpModule,
    MongooseModule.forFeature([
      { name: NftSchema.name, schema: nftSchema },
      {
        name: ContractSchema.name,
        schema: contractSchema,
      },
      {
        name: MetadataSchema.name,
        schema: metadataSchema,
      },
      { name: AuctionSchema.name, schema: auctionSchema },
      { name: BidSchema.name, schema: bidSchema },
      { name: Nft1155Schema.name, schema: nft1155Schema },
      { name: Nft1155OwnerSchema.name, schema: nft1155OwnerSchema },
    ]),
  ],
  controllers: [NftController721, NftController1155, NftMintController],
  providers: [NftService],
  exports: [NftService],
})
export class NftModule {}
