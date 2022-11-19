import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, PromiseProvider, Types } from 'mongoose';
export type metadataDocument = MetaData & Document;

@Schema({ timestamps: true })
export class MetaData {
  @Prop()
  contract_address: string;

  @Prop({ enum: ['NGM721PSI', 'NGM1155', 'NGMTINY721'] })
  contract_type: string;

  @Prop()
  tokenUri: Array<{
    tokenId: number;
    uri: string;
  }>;

  @Prop()
  chain: string;
}

export const metadataSchema = SchemaFactory.createForClass(MetaData);
