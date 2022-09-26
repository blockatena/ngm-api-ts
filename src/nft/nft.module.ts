import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { NftController } from './nft.controller';
import { NftService } from './nft.service';

@Module({
  controllers: [NftController],
  providers: [NftService],
  imports: [HttpModule],
})
export class NftModule {}
