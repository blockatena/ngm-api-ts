import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, PromiseProvider, Types } from 'mongoose';
import { type } from 'os';
export type NftDocument = NftSchema & Document;

@Schema({ timestamps: true })
export class NftSchema {
  @Prop()
  contract_address: string;
  @Prop({ enum: ['NGM721PSI', 'NGM1155', 'NGMTINY721'] })
  contract_type: string;
  @Prop()
  token_id: string;
  @Prop({ unique: true })
  meta_data_url: string;

  @Prop({ default: false })
  is_in_auction: boolean;

  @Prop({ default: false })
  is_in_sale: boolean;

  @Prop()
  token_owner: string;

  @Prop({ type: Object })
  meta_data: {
    name: string;

    image: string;

    description: string;

    external_uri: string;

    attributes: [object];
  };
}

export const nftSchema = SchemaFactory.createForClass(NftSchema);
nftSchema.pre('save', async () => {});
