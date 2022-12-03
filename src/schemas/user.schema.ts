import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = UserSchema & Document;

@Schema({ timestamps: true })
export class UserSchema {
  @Prop({ unique: true })
  username: string;
  @Prop({ unique: true })
  wallet_address: string;
  @Prop({ unique: true })
  email: string;
}

export const userSchema = SchemaFactory.createForClass(UserSchema);
