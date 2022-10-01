import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { NftModule } from './nft/nft.module';
import { DeploymentModule } from './deployment/deployment.module';
import { ConfigModule } from '@nestjs/config';
import { TextileModule } from './textile/textile.module';
import * as redisStore from 'cache-manager-redis-store';
import { APP_INTERCEPTOR } from '@nestjs/core';
@Module({
  imports: [NftModule, AuthModule, UserModule, DeploymentModule, TextileModule],
})
export class AppModule {}
