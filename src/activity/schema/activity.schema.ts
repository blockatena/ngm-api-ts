import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
export type ActivityDocument = ActivitySchema & Document;

@Schema({ timestamps: true })
export class ActivitySchema {
    @Prop({
        enum: ['Minted', 'Cancel List', 'Place bid', 'Cancel bid', 'Transfer', 'Make Offer', 'Cancel Sale',
            'Offer Accepted', 'Won Bid', 'Sale', 'Cancel Offer', 'List', ' Cancel Offer']
    })
    event: string;
    @Prop({ type: Object })
    item: Object;
    @Prop()
    price: string;
    @Prop()
    quantity: string;
    @Prop({ required: false })
    transaction_hash: string;
    @Prop()
    from: string;
    @Prop()
    to: string;
    @Prop()
    read: string;

}

export const activitySchema = SchemaFactory.createForClass(ActivitySchema);
