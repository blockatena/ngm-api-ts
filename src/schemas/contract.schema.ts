import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type ContractDocument = ContractSchema & Document;

@Schema({ timestamps: true })
export class ContractSchema {
  @Prop()
  symbol: string;
  @Prop()
  owner_address: string;
  @Prop({ unique: true })
  collection_name: string;
  @Prop()
  chain: string;
  @Prop()
  type: string;
  @Prop()
  transactionhash: string;
  @Prop({ unique: true })
  contract_address: string;
  @Prop()
  description: string;
  @Prop()
  baseuri: string;
  @Prop()
  imageuri: Array<string>;
}

export const contractSchema = SchemaFactory.createForClass(ContractSchema);
