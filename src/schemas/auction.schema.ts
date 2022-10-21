import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type AuctionDocument = AuctionSchema & Document;

@Schema()
export class AuctionSchema {
  @Prop()
  owner_address: string;
  @Prop({ type: mongoose.Types.ObjectId, ref: 'nftSchema' })
  nft_id: mongoose.Types.ObjectId;
  @Prop()
  start_date: string;
  @Prop()
  end_date: string;
  @Prop()
  min_price: string;
}
export const auctionSchema = SchemaFactory.createForClass(AuctionSchema);
