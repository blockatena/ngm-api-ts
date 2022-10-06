import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = UserSchema & Document;

@Schema()
export class UserSchema {
  @Prop()
  username: string;

  @Prop()
  roles: string;

  @Prop()
  jwt: string;
}

export const userSchema = SchemaFactory.createForClass(UserSchema);
