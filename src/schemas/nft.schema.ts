import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NftDocument = NftSchema & Document;

@Schema()
export class NftSchema {
  @Prop()
  contract_address: string;
  @Prop()
  contract_type: ['NGM721PSI', 'NGM1155', 'NGMTINY721'];
  @Prop()
  token_id: string;
  @Prop()
  meta_data_url: string;
}

export const nftSchema = SchemaFactory.createForClass(NftSchema);
