import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type BidDocument = BidSchema & Document;

@Schema()
export class BidSchema {
  @Prop()
  auction_id: string;
  @Prop()
  bidder_address: string;
  @Prop()
  token_id: string;
  @Prop()
  bid_amount: number;
  @Prop()
  bid_expiresin: string;
}
export const bidSchema = SchemaFactory.createForClass(BidSchema);
