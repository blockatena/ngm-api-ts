import { HttpModule } from '@nestjs/axios';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';
import * as redisStore from 'cache-manager-redis-store';
import { CacheModule, Module } from '@nestjs/common';
import { RedisCliService } from '../redis-cli/redis-cli.service';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
import { JwtModule } from '@nestjs/jwt';
import { DeploymentService } from 'src/deployment/deployment.service';
import { contractSchema, ContractSchema } from 'src/schemas/contract.schema';
import { MongooseModule } from '@nestjs/mongoose';

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
    MongooseModule.forFeature([
      { name: ContractSchema.name, schema: contractSchema },
    ]),
  ],
  controllers: [NftController],
  providers: [NftService, RedisCliService, JwtAuthService, DeploymentService],
})
export class NftModule {}
