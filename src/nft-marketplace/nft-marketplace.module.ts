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

@Module({
  imports: [
    forwardRef(() => NftModule),
    MongooseModule.forFeature([
      { name: AuctionSchema.name, schema: auctionSchema },
      { name: BidSchema.name, schema: bidSchema },
      { name: ContractSchema.name, schema: contractSchema },
      { name: SalesSchema.name, schema: salesSchema },
      { name: OfferSchema.name, schema: offerSchema },
    ]),
  ],
  controllers: [NftMarketplaceController],
  providers: [NftMarketplaceService],
  exports: [NftMarketplaceService],
})
export class NftMarketplaceModule {}
