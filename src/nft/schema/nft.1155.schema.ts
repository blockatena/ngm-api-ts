import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type Nft1155Document = Nft1155Schema & Document;

@Schema({ timestamps: true })
export class Nft1155Schema {
    @Prop()
    contract_address: string;
    @Prop({ enum: ['NGM1155'] })
    contract_type: string;
    @Prop({ type: Object })
    chain: { id: number, name: string };
    @Prop()
    token_id: number;
    @Prop({ default: '0' })
    price: string;
    @Prop()
    highest_price: number;
    @Prop()
    meta_data_url: string;
    @Prop({ default: false })
    is_in_auction: boolean;
    @Prop({ default: false })
    is_in_sale: boolean;
    @Prop()
    token_owner: string;
    @Prop({ type: Object })
    meta_data: {
        name: string;

        image: string;

        description: string;

        external_uri: string;

        attributes: [object];
    };
}

export const nft1155Schema = SchemaFactory.createForClass(Nft1155Schema);

