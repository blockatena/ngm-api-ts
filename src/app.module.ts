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
import configuration from './config/configuration';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { SubscriptionModule } from './subscription/subscription.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
const { EMAIL_ADDR, EMAIL_PASSWORD } = configuration().EMAIL;
const { LIMIT, TTL } = configuration().RATE_LIMIT;
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        host: 'smtp.gmail.com',
        ignoreTLS: true,
        secure: false,
        auth: {
          user: EMAIL_ADDR,
          pass: EMAIL_PASSWORD,
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@localhost>',
      },
      preview: false,
      template: {
        dir: join(__dirname, 'template'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),
    ScheduleModule.forRoot(),
    MongooseModule.forRoot(configuration().ATLAS),
    NftModule,
    DeploymentModule,
    TextileModule,
    UsersModule,
    NftMarketplaceModule,
    MetadataModule,
    ActivityModule,
    EmailModule,
    SubscriptionModule,
    ThrottlerModule.forRoot({
      ttl: parseInt(TTL) || 60,
      limit: parseInt(LIMIT) || 10,
    })
  ],
  providers: [CronjobService, AppService, {
    provide: APP_GUARD,
    useClass: ThrottlerGuard
  }
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private appService: AppService) { }

  onModuleInit() {
    this.appService.handleCron();
  }
}
