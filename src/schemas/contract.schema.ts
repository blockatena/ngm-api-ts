import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, set, StringExpressionOperatorReturningBoolean } from 'mongoose';
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
  total_supply: number;
  @Prop({ type: Object })
  chain: { id: number, name: string };
  @Prop()
  type: string;
  @Prop()
  transactionhash: string;
  @Prop()
  contract_address: string;
  @Prop()
  description: string;
  @Prop()
  baseuri: string;
  @Prop()
  imageuri: Array<string>;
  @Prop({ default: 0 })
  trade_volume: string;
}

export const contractSchema = SchemaFactory.createForClass(ContractSchema);
