import { HttpModule } from '@nestjs/axios';
import { NftController721 } from './g2w3721.controller';
import { NftController1155 } from './g2w31155.controller';
import { NftService } from './nft.service';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, forwardRef, Module } from '@nestjs/common';
// import { RedisCliService } from '../redis-cli/redis-cli.service';
// import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
// import { JwtModule } from '@nestjs/jwt';
import { DeploymentService } from 'src/deployment/deployment.service';
import { contractSchema, ContractSchema } from 'src/schemas/contract.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { NftSchema, nftSchema } from 'src/nft/schema/nft.schema';
import { NftMarketplaceModule } from 'src/nft-marketplace/nft-marketplace.module';
import { DeploymentModule } from 'src/deployment/deployment.module';
import { metadata, metadataSchema } from 'src/metadata/schema/metadata.schema';
import { AuctionSchema, auctionSchema } from 'src/schemas/auction.schema';
import { BidSchema, bidSchema } from 'src/schemas/bid.schema';
import { ActivityModule } from 'src/activity/activity.module';
import { UsersModule } from 'src/users/users.module';
import { nft1155Schema, Nft1155Schema } from './schema/nft.1155.schema';
import { nft1155OwnerSchema, Nft1155OwnerSchema } from 'src/schemas/user-1155.schema';
import { CommonModule } from 'src/common/common.module';
import { NftMintController } from './mint.controller';

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
        name: metadata.name,
        schema: metadataSchema,
      },
      { name: AuctionSchema.name, schema: auctionSchema },
      { name: BidSchema.name, schema: bidSchema },
      { name: Nft1155Schema.name, schema: nft1155Schema },
      { name: Nft1155OwnerSchema.name, schema: nft1155OwnerSchema }
    ]),
    // JwtModule.register({
    //   secret: process.env.jwtSecret,
    //   signOptions: { expiresIn: process.env.ExpiresIN },
    // }),
    // CacheModule.register({
    //   store: redisStore,
    //   host: process.env.REDIS_HOST,
    //   port: process.env.REDIS_PORT,
    //   db: process.env.REDIS_DB,
    // }),
  ],
  controllers: [NftController721,
    NftController1155, NftMintController],
  providers: [NftService],
  //  add to  RedisCliService
  exports: [NftService],
})
export class NftModule { }
