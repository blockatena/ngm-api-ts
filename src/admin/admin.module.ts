import { Module } from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { CronjobService } from 'src/services/cronjob.service';
import { SubscriptionController } from './subscription.controller';
import { SubscriptionService } from './subscription.service';
import { EmailService } from 'src/services/email.service';
import {
  ContractSchema,
  contractSchema,
} from 'src/core/deployment/schema/contract.schema';
import {
  AuctionSchema,
  auctionSchema,
} from 'src/core/marketplace/schema/auction.schema';
import { BidSchema, bidSchema } from 'src/core/marketplace/schema/bid.schema';
import {
  OfferSchema,
  offerSchema,
} from 'src/core/marketplace/schema/offer.schema';
import {
  SalesSchema,
  salesSchema,
} from 'src/core/marketplace/schema/sales.schema';
import { NftSchema, nftSchema } from 'src/core/nft/schema/nft.schema';
import {
  Offer1155Schema,
  offer1155Schema,
} from 'src/core/nft/schema/offer1155.schema';
import {
  Sale1155Schema,
  sale1155Schema,
} from 'src/core/nft/schema/sale1155.schema';
import { UsersModule } from 'src/core/users/users.module';
@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: AuctionSchema.name, schema: auctionSchema },
      { name: BidSchema.name, schema: bidSchema },
      { name: NftSchema.name, schema: nftSchema },
      { name: ContractSchema.name, schema: contractSchema },
      { name: SalesSchema.name, schema: salesSchema },
      { name: OfferSchema.name, schema: offerSchema },
      { name: Sale1155Schema.name, schema: sale1155Schema },
      { name: Offer1155Schema.name, schema: offer1155Schema },
    ]),
  ],
  controllers: [AdminController, SubscriptionController],
  providers: [AdminService, SubscriptionService, EmailService, CronjobService],
})
export class AdminModule {}
