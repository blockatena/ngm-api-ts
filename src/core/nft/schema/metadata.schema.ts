import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type metadataDocument = metadata & Document;

@Schema({ timestamps: true })
export class metadata {
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

export const metadataSchema = SchemaFactory.createForClass(metadata);
