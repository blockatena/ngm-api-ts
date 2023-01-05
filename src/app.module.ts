import { Module, OnModuleInit } from '@nestjs/common';
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

import { AdminModule } from './admin/admin.module';

import { MetadataModule } from './metadata/metadata.module';
import { AppService } from './app.service';
import { NftMarketplaceService } from './nft-marketplace/nft-marketplace.service';
import { ActivityModule } from './activity/activity.module';
import { EmailModule } from './email/email.module';
import { SubscriptionModule } from './subscription/subscription.module';
import configuration from './config/configuration';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MongooseModule.forRoot(configuration().ATLAS),
    NftModule,
    // AuthModule,
    DeploymentModule,
    TextileModule,
    UsersModule,
    NftMarketplaceModule,
    // AdminModule,
    MetadataModule,
    ActivityModule,
    EmailModule,
    SubscriptionModule,
  ],
  providers: [CronjobService, AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private appService: AppService) { }

  onModuleInit() {
    console.log(`Initialization...`);
    this.appService.handleCron();
  }
}
