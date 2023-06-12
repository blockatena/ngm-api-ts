import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = UserSchema & Document;

@Schema({ timestamps: true })
export class UserSchema {
  @Prop()
  username: string;

  @Prop({ required: true, unique: true })
  wallet_address: string;

  @Prop({ unique: true })
  email: string;

  @Prop({ default: '' })
  profile_image: string;

  @Prop({ default: '' })
  banner_image: string;

  @Prop({
    _id: false,
    type: {
      collections: { type: Number, default: 0 },
      assets: { type: Number, default: 0 },
    },
  })
  limit: Record<string, number>;

  @Prop({
    _id: false,
    type: {
      collections: {
        type: [String],
        default: [],
        required: false,
      },
      nfts: {
        ngm721: {
          _id: false,
          type: [{ contract_address: String, token_id: Number }],
          required: false,
          default: [],
        },
        ngm1155: {
          _id: false,
          type: [{ contract_address: String, token_id: Number }],
          required: false,
          default: [],
        },
      },
    },
    default: {
      collections: [],
      nfts: { ngm721: [], ngm1155: [] },
    },
  })
  favourites: {
    collections: string[];
    nfts: {
      ngm721: { contract_address: string; token_id: number }[];
      ngm1155: { contract_address: string; token_id: number }[];
    };
  };

  @Prop({ sparse: true })
  api_key: string;
}

export const userSchema = SchemaFactory.createForClass(UserSchema);
