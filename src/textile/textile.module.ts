import { Module } from '@nestjs/common';
import { TextileService } from './textile.service';
import { TextileController } from './textile.controller';

@Module({
  controllers: [TextileController],
  providers: [TextileService],
})
export class TextileModule {}
