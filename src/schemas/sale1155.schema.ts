import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type Sale1155Document = Sale1155Schema & Document;

@Schema({ timestamps: true })
export class Sale1155Schema {
    @Prop()
    token_owner: string;
    @Prop()
    contract_address: string;
    @Prop()
    token_id: string;
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
export const sale1155Schema = SchemaFactory.createForClass(Sale1155Schema);
// DB functions
sale1155Schema.pre('save', function () {
    this.status = 'started';
});
