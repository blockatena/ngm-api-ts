import { HttpModule } from '@nestjs/axios';
import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';
import * as redisStore from 'cache-manager-redis-store';
import { redisCacheManger } from 'src/redis/redi.service';
import { RolesGuard } from 'src/guards/roles.guard';
// import { ConfigModule } from '@nestjs/config';
@Module({
  imports: [
    HttpModule,
    CacheModule.register({
      isGlobal: true,
      // store: redisStore,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT),
    }),
  ],
  controllers: [NftController],
  providers: [
    NftService,
    redisCacheManger,
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class NftModule {}
