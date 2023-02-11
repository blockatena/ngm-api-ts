import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

class Limit {
  collections: number;
  assets: number;
}

export type UserDocument = UserSchema & Document;

@Schema({ timestamps: true })
export class UserSchema {
  @Prop()
  username: string;
  @Prop({ unique: true })
  wallet_address: string;
  @Prop({ unique: true })
  email: string;
  @Prop()
  profile_image: string;
  @Prop()
  banner_image: string;
  @Prop({ type: Limit })
  limit: {
    collections: number,
    assets: number
  };
  @Prop({ unique: true })
  api_key: string;
}

export const userSchema = SchemaFactory.createForClass(UserSchema);
