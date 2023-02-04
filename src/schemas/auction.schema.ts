import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type AuctionDocument = AuctionSchema & Document;

@Schema({ timestamps: true })
export class AuctionSchema {
  @Prop()
  token_owner: string;
  @Prop()
  contract_address: string;
  @Prop()
  token_id: number;
  @Prop()
  start_date: string;
  @Prop()
  end_date: string;
  @Prop()
  min_price: string;
  @Prop()
  status: string;
  @Prop()
  winner: string;
  @Prop()
  transaction_status: string;
  // add cron job exclude
}
export const auctionSchema = SchemaFactory.createForClass(AuctionSchema);
// DB functions
auctionSchema.pre('save', function () {
  this.status = 'started';
});
