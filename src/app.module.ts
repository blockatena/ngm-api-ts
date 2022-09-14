import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { NftModule } from './nft/nft.module';
import { DeploymentModule } from './deployment/deployment.module';

@Module({
  imports: [NftModule, AuthModule, UserModule, BookmarkModule, DeploymentModule],
})
export class AppModule {}
