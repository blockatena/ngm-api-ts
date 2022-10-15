import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SalesDocument = SalesShema & Document;
@Schema()
export class SalesShema {
  @Prop()
  buyer_address: string;
  @Prop()
  seller_address: string;
  @Prop()
  nft: string;
  @Prop()
  price: string;
  @Prop()
  transaction_hash: string;
  @Prop()
  transaction_date: string;
}
export const salesSchema = SchemaFactory.createForClass(SalesShema);
