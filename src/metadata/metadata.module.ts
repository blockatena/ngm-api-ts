import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { metadata, metadataSchema } from 'src/schemas/metadata.schema';
import { MetadataController } from './metadata.controller';
import { MetadataService } from './metadata.service';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      {
        name: metadata.name,
        schema: metadataSchema,
      },
    ]),
  ],
  controllers: [MetadataController],
  providers: [MetadataService],
})
export class MetadataModule {}
