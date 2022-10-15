import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type BidDocument = BidSchema & Document;

@Schema()
export class BidSchema {
  @Prop()
  bidder_address: string;
  @Prop()
  nft: string;
  @Prop()
  bid_amount: string;
  @Prop()
  bid_expires: string;
  @Prop()
  transaction_hash: string;
}
export const bidSchema = SchemaFactory.createForClass(BidSchema);
