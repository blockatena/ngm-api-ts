import { Module } from '@nestjs/common';
import { NftMarketplaceService } from './nft-marketplace.service';
import { NftMarketplaceController } from './nft-marketplace.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { auctionSchema, AuctionSchema } from 'src/schemas/auction.schema';
import { bidSchema, BidSchema } from 'src/schemas/bid.schema';
import { NftModule } from 'src/nft/nft.module';
import { nftSchema, NftSchema } from 'src/schemas/nft.schema';
import { NftService } from 'src/nft/nft.service';
import { contractSchema, ContractSchema } from 'src/schemas/contract.schema';
import { Market_Place_Constants } from 'src/utils/constants/MARKETPLACE/marketplace.constants';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuctionSchema.name, schema: auctionSchema },
      { name: BidSchema.name, schema: bidSchema },
      { name: NftSchema.name, schema: nftSchema },
      { name: ContractSchema.name, schema: contractSchema },
    ]),
  ],
  controllers: [NftMarketplaceController],
  providers: [NftMarketplaceService, Market_Place_Constants],
})
export class NftMarketplaceModule {}
