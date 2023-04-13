import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type OfferDocument = OfferSchema & Document;

@Schema({ timestamps: true })
export class OfferSchema {
  @Prop()
  sale_id: string;
  @Prop()
  contract_address: string;
  @Prop()
  token_id: number;
  @Prop()
  offer_price: string;
  @Prop()
  offer_person_address: string;
  @Prop()
  offer_status: string;
}
export const offerSchema = SchemaFactory.createForClass(OfferSchema);
offerSchema.pre('save', function () {
  this.offer_status = 'started';
});
