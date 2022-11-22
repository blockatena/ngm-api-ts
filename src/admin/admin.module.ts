import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AuctionSchema, auctionSchema } from 'src/schemas/auction.schema';
import { BidSchema, bidSchema } from 'src/schemas/bid.schema';
import { ContractSchema, contractSchema } from 'src/schemas/contract.schema';
import { NftSchema, nftSchema } from 'src/nft/schema/nft.schema';

import { CronjobService } from 'src/cronjob/cronjob.service';
import {
  OfferSchema,
  offerSchema,
} from 'src/nft-marketplace/schema/offer.schema';
import {
  SalesSchema,
  salesSchema,
} from 'src/nft-marketplace/schema/sales.schema';

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
  controllers: [AdminController],
  providers: [AdminService, CronjobService],
})
export class AdminModule {}
