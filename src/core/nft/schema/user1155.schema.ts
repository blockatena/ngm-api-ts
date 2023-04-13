import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type Nft1155OwnerDocument = Nft1155OwnerSchema & Document;

@Schema({ timestamps: true })
export class Nft1155OwnerSchema {
  @Prop()
  contract_address: string;
  @Prop()
  token_id: number;
  @Prop({ type: Object })
  chain: { id: number; name: string };
  @Prop()
  token_owner: string;
  @Prop()
  number_of_tokens: number;
}
export const nft1155OwnerSchema =
  SchemaFactory.createForClass(Nft1155OwnerSchema);
