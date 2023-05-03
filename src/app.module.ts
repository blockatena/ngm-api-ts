import { Module, OnModuleInit } from '@nestjs/common';
import { TextileModule } from './textile/textile.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { CronjobService } from './services/cronjob.service';
import { AppService } from './app.service';
import { ActivityModule } from './activity/activity.module';
import configuration from './config/configuration';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { CommonModule } from './common/common.module';
import { AdminModule } from './admin/admin.module';
import { HttpExceptionFilter } from './filters/base-exception.fiter';
import ConfigValidation from './config/validation.schema';
import { DeploymentModule } from './core/deployment/deployment.module';
import { NftMarketplaceModule } from './core/marketplace/marketplace.module';
import { MetadataModule } from './core/metadata/metadata.module';
import { NftModule } from './core/nft/nft.module';
import { UsersModule } from './core/users/users.module';
import { PaymentModule } from './core/payment/payment.module';
const { EMAIL_ADDR, EMAIL_PASSWORD } = configuration().EMAIL;
const { LIMIT, TTL } = configuration().RATE_LIMIT;
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: ConfigValidation,
    }),
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
    //need-to-optimise
    MongooseModule.forRoot(configuration().ATLAS),
    AdminModule,
    NftModule,
    DeploymentModule,
    TextileModule,
    UsersModule,
    NftMarketplaceModule,
    MetadataModule,
    ActivityModule,
    ThrottlerModule.forRoot({
      ttl: parseInt(TTL) || 60,
      limit: parseInt(LIMIT) || 10,
    }),
    CommonModule,
    PaymentModule,
  ],
  providers: [
    CronjobService,
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private appService: AppService) { }

  async onModuleInit() {
    await this.appService.onModuleInit();
  }
}
