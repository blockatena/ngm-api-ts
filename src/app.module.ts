import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { NftModule } from './nft/nft.module';
import { DeploymentModule } from './deployment/deployment.module';
import { TextileModule } from './textile/textile.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { NftMarketplaceModule } from './nft-marketplace/nft-marketplace.module';
import { ScheduleModule } from '@nestjs/schedule';

import { CronjobService } from './cronjob/cronjob.service';
import { MetadataModule } from './metadata/metadata.module';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRoot(process.env.ATLAS),
    NftModule,
    AuthModule,
    DeploymentModule,
    TextileModule,
    UsersModule,
    NftMarketplaceModule,
    MetadataModule,
  ],
  providers: [CronjobService],
})
export class AppModule {}
