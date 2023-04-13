import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type metadataDocument = MetadataSchema & Document;

@Schema({ timestamps: true })
export class MetadataSchema {
  @Prop()
  contract_address: string;

  @Prop({ enum: ['NGM721PSI', 'NGM1155', 'NGMTINY721'] })
  contract_type: string;

  @Prop()
  tokenUri: Array<{
    tokenId: number;
    uri: string;
  }>;

  @Prop({ type: Object })
  chain: { id: number; name: string };
}

export const metadataSchema = SchemaFactory.createForClass(MetadataSchema);
