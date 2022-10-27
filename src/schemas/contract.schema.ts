import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ContractDocument = ContractSchema & Document;

@Schema()
export class ContractSchema {
  @Prop()
  symbol: string;
  @Prop()
  ownerAddress: string;
  @Prop()
  collectionName: string;
  @Prop()
  chain: string;
  @Prop()
  type: string;
  @Prop()
  transactionhash: string;
  @Prop({ unique: true })
  contractaddress: string;
  @Prop()
  baseuri: string;
  @Prop()
  imageuri: string;
}

export const contractSchema = SchemaFactory.createForClass(ContractSchema);
