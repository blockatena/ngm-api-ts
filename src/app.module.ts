import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { NftModule } from './nft/nft.module';
import { DeploymentModule } from './deployment/deployment.module';
import { ConfigModule } from '@nestjs/config';
import { TextileModule } from './textile/textile.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    NftModule,
    AuthModule,
    UserModule,
    BookmarkModule,
    DeploymentModule,
    TextileModule,
  ],
})
export class AppModule {}
