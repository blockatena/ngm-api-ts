import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type BidDocument = BidSchema & Document;

@Schema({ timestamps: true })
export class BidSchema {
  @Prop()
  auction_id: string;
  @Prop()
  bidder_address: string;
  @Prop()
  contract_address: string;
  @Prop()
  token_id: string;
  @Prop()
  bid_amount: string;
  // @Prop()
  // bid_expires_in: string;
  @Prop({ default: false })
  is_auction_ended: boolean;
  @Prop()
  status: string;
  @Prop()
  won: boolean;
}
export const bidSchema = SchemaFactory.createForClass(BidSchema);
bidSchema.pre('save', function () {
  this.status = 'started';
});
