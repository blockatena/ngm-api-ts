import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';

@Module({
  imports: [
    HttpModule.register({
      timeout: 500000,
    }),
  ],
  controllers: [NftController],
  providers: [NftService],
})
export class NftModule {}
