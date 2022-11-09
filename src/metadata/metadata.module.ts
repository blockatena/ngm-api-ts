import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NftService } from 'src/nft/nft.service';
import { contractSchema, ContractSchema } from 'src/schemas/contract.schema';
import { metadata, metadataSchema } from 'src/schemas/metadata.schema';
import { nftSchema, NftSchema } from 'src/schemas/nft.schema';
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
      {
        name: NftSchema.name,
        schema: nftSchema,
      },
      {
        name: ContractSchema.name,
        schema: contractSchema,
      },
    ]),
  ],
  controllers: [MetadataController],
  providers: [MetadataService, NftService],
})
export class MetadataModule {}
