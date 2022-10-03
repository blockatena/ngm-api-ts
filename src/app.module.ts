import { CacheInterceptor, CacheModule, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { NftModule } from './nft/nft.module';
import { DeploymentModule } from './deployment/deployment.module';
import { TextileModule } from './textile/textile.module';
import { ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { APP_INTERCEPTOR } from '@nestjs/core';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CacheModule.register({
      store: redisStore,
      ttl: 5,
      host: 'localhost',
      port: 6379,
    }),
    NftModule,
    AuthModule,
    DeploymentModule,
    TextileModule,
  ],
  providers: [{ provide: APP_INTERCEPTOR, useClass: CacheInterceptor }],
})
export class AppModule {}
