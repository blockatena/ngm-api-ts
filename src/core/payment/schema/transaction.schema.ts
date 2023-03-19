import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { TransactionModeEnum } from '../enum/transaction.mode.enum';
import { TransactionStatusEnum } from '../enum/transaction.status.enum';
import { CurrencyEnum } from '../enum/currency.enum';
import { TransactionTypeEnum } from '../enum/transaction.type.enum';
export type TransactionDocument = TransactionSchema & Document;

@Schema({ timestamps: true })
export class TransactionSchema {
  @Prop()
  from: string;
  @Prop()
  to: string;
  @Prop({ enum: CurrencyEnum })
  currency: string;
  @Prop({ enum: TransactionModeEnum })
  transactionMode: TransactionModeEnum;
  @Prop()
  amount: number;
  @Prop({ enum: TransactionStatusEnum })
  status: TransactionStatusEnum;
  @Prop()
  transactionId: string;
  @Prop({ enum: TransactionTypeEnum })
  transactionType: TransactionTypeEnum;
}
export const transactionSchema =
  SchemaFactory.createForClass(TransactionSchema);
