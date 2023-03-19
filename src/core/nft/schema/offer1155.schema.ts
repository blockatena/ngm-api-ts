import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type Offer1155Document = Offer1155Schema & Document;

@Schema({ timestamps: true })
export class Offer1155Schema {
  @Prop()
  contract_address: string;
  @Prop()
  token_id: number;
  @Prop()
  offer_person_address: string;
  @Prop()
  number_of_tokens: number;
  @Prop()
  per_unit_price: number;
  @Prop()
  status: string;
}
export const offer1155Schema = SchemaFactory.createForClass(Offer1155Schema);
// DB functions
offer1155Schema.pre('save', function () {
  this.status = 'started';
});
