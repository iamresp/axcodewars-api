import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type TTaskUserDocument = HydratedDocument<TaskUser>;

@Schema()
export class TaskUser {
  @Prop()
  taskUuid: string;

  @Prop()
  userUuid: string;
}

export const TaskUserSchema = SchemaFactory.createForClass(TaskUser);
