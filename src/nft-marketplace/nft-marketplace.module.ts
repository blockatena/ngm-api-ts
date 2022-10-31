import { Module } from '@nestjs/common';
import { NftMarketplaceService } from './nft-marketplace.service';
import { NftMarketplaceController } from './nft-marketplace.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { auctionSchema, AuctionSchema } from 'src/schemas/auction.schema';
import { bidSchema, BidSchema } from 'src/schemas/bid.schema';
import { nftSchema, NftSchema } from 'src/schemas/nft.schema';
import { contractSchema, ContractSchema } from 'src/schemas/contract.schema';
import { Market_Place_Constants } from 'src/utils/constants/MARKETPLACE/marketplace.constants';
import { CronjobService } from 'src/cronjob/cronjob.service';
import { salesSchema, SalesSchema } from 'src/schemas/sales.schema';
import { offerSchema, OfferSchema } from 'src/schemas/offer.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuctionSchema.name, schema: auctionSchema },
      { name: BidSchema.name, schema: bidSchema },
      { name: NftSchema.name, schema: nftSchema },
      { name: ContractSchema.name, schema: contractSchema },
      { name: SalesSchema.name, schema: salesSchema },
      { name: OfferSchema.name, schema: offerSchema },
    ]),
  ],
  controllers: [NftMarketplaceController],
  providers: [NftMarketplaceService, CronjobService],
})
export class NftMarketplaceModule {}
