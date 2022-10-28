import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type OfferDocument = OfferSchema & Document;

@Schema()
export class OfferSchema {
  @Prop()
  token_id: string;
  @Prop()
  offer_price: string;
  @Prop()
  offer_currency: string;
  @Prop()
  offer_person_address: string;
  @Prop()
  offer_status: string;
}
export const offerSchema = SchemaFactory.createForClass(OfferSchema);
