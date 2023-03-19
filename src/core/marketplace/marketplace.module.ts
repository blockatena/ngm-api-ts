import { forwardRef, Module } from '@nestjs/common';
import { NftMarketplaceService } from './marketplace.service';
import { NftMarketplaceController } from './marketplace.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityModule } from 'src/activity/activity.module';
import { NftMarketplace1155Controller } from './maketplace1155.controller';
import { CommonModule } from 'src/common/common.module';
import { BidSchema, bidSchema } from './schema/bid.schema';
import { OfferSchema, offerSchema } from './schema/offer.schema';
import { SalesSchema, salesSchema } from './schema/sales.schema';
import {
  ContractSchema,
  contractSchema,
} from '../deployment/schema/contract.schema';
import { NftModule } from '../nft/nft.module';
import {
  Offer1155Schema,
  offer1155Schema,
} from '../nft/schema/offer1155.schema';
import { Sale1155Schema, sale1155Schema } from '../nft/schema/sale1155.schema';
import { AuctionSchema, auctionSchema } from './schema/auction.schema';
@Module({
  imports: [
    forwardRef(() => NftModule),
    forwardRef(() => CommonModule),
    ActivityModule,
    MongooseModule.forFeature([
      { name: AuctionSchema.name, schema: auctionSchema },
      { name: BidSchema.name, schema: bidSchema },
      { name: ContractSchema.name, schema: contractSchema },
      { name: SalesSchema.name, schema: salesSchema },
      { name: OfferSchema.name, schema: offerSchema },
      { name: Sale1155Schema.name, schema: sale1155Schema },
      { name: Offer1155Schema.name, schema: offer1155Schema },
    ]),
  ],
  controllers: [NftMarketplaceController, NftMarketplace1155Controller],
  providers: [NftMarketplaceService],
  exports: [NftMarketplaceService],
})
export class NftMarketplaceModule {}
