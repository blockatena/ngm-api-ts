import { forwardRef, Module } from '@nestjs/common';
import { NftMarketplaceService } from './nft-marketplace.service';
import { NftMarketplaceController } from './nft-marketplace.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { contractSchema, ContractSchema } from 'src/schemas/contract.schema';
import { NftModule } from 'src/nft/nft.module';
import { AuctionSchema, auctionSchema } from 'src/schemas/auction.schema';
import { BidSchema, bidSchema } from 'src/schemas/bid.schema';
import { OfferSchema, offerSchema } from 'src/schemas/offer.schema';
import { SalesSchema, salesSchema } from 'src/schemas/sales.schema';
import { ActivityModule } from 'src/activity/activity.module';
import { NftMarketplace1155Controller } from './nft-maketplace-1155.controller';
import { Offer1155Schema, offer1155Schema } from 'src/schemas/offer1155.schema';
import { Sale1155Schema, sale1155Schema } from 'src/schemas/sale1155.schema';
import { CommonModule } from 'src/common/common.module';
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
export class NftMarketplaceModule { }
