import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TUserConnectionDocument = HydratedDocument<UserConnection>;

@Schema()
export class UserConnection {
  @Prop()
  userUuid: string;

  @Prop()
  connId: string;
}

export const UserConnectionSchema =
  SchemaFactory.createForClass(UserConnection);
