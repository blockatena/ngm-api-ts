import { HttpModule } from '@nestjs/axios';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, Module } from '@nestjs/common';
import { RedisCliService } from '../redis-cli/redis-cli.service';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { JwtModule } from '@nestjs/jwt';
require('dotenv').config();
@Module({
  imports: [
    HttpModule,
    JwtModule.register({
      secret: process.env.jwtSecret,
      signOptions: { expiresIn: process.env.ExpiresIN },
    }),
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      db: process.env.REDIS_DB,
    }),
  ],
  controllers: [NftController],
  providers: [NftService, RedisCliService, JwtAuthService],
})
export class NftModule {}
