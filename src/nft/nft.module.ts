import { HttpModule } from '@nestjs/axios';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, Module } from '@nestjs/common';
// import { RedisCliService } from '../redis-cli/redis-cli.service';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { JwtModule } from '@nestjs/jwt';
import { DeploymentService } from 'src/deployment/deployment.service';
import { contractSchema, ContractSchema } from 'src/schemas/contract.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { NftSchema, nftSchema } from 'src/schemas/nft.schema';
import { MetaData, metadataSchema } from 'src/schemas/metadata.schema';
import { AuctionSchema, auctionSchema } from 'src/schemas/auction.schema';
import { BidSchema, bidSchema } from 'src/schemas/bid.schema';

require('dotenv').config();
@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: NftSchema.name, schema: nftSchema },
      {
        name: ContractSchema.name,
        schema: contractSchema,
      },
      {
        name: MetaData.name,
        schema: metadataSchema,
      },
      { name: AuctionSchema.name, schema: auctionSchema },
      { name: BidSchema.name, schema: bidSchema },
    ]),
    JwtModule.register({
      secret: process.env.jwtSecret,
      signOptions: { expiresIn: process.env.ExpiresIN },
    }),
    // CacheModule.register({
    //   store: redisStore,
    //   host: process.env.REDIS_HOST,
    //   port: process.env.REDIS_PORT,
    //   db: process.env.REDIS_DB,
    // }),
  ],
  controllers: [NftController],
  providers: [NftService, JwtAuthService, DeploymentService],
  //  add to  RedisCliService
  exports: [NftModule],
})
export class NftModule {}
