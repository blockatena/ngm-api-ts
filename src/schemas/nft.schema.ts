import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, PromiseProvider, Types } from 'mongoose';

export type NftDocument = NftSchema & Document;

@Schema()
export class NftSchema {
  @Prop()
  contract_address: string;
  @Prop({ enum: ['NGM721PSI', 'NGM1155', 'NGMTINY721'] })
  contract_type: string;
  @Prop()
  token_id: string;
  @Prop()
  meta_data_url: string;
  @Prop({ default: false })
  is_in_auction: boolean;
  @Prop()
  token_owner: string;
}

export const nftSchema = SchemaFactory.createForClass(NftSchema);
