import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { BookmarkModule } from './bookmark/bookmark.module';
import { NftModule } from './nft/nft.module';

@Module({
  imports: [NftModule, AuthModule, UserModule, BookmarkModule],
})
export class AppModule {}
