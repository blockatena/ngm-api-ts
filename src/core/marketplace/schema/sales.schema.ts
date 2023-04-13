import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SalesDocument = SalesSchema & Document;
@Schema({ timestamps: true })
export class SalesSchema {
  @Prop()
  token_owner: string;
  @Prop()
  contract_address: string;
  @Prop()
  token_id: number;
  @Prop()
  price: string;
  @Prop()
  start_date: string;
  @Prop()
  end_date: string;
  @Prop()
  status: string;
}
export const salesSchema = SchemaFactory.createForClass(SalesSchema);
salesSchema.pre('save', function () {
  this.status = 'started';
});
