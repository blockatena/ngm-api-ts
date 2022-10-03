import { HttpModule } from '@nestjs/axios';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, Module } from '@nestjs/common';
import { RedisCliService } from '../redis-cli/redis-cli.service';
@Module({
  imports: [
    HttpModule,

    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
      db: 1,
    }),
  ],
  controllers: [NftController],
  providers: [NftService, RedisCliService],
})
export class NftModule {}
