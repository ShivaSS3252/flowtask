import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TaskDocument = Task & Document;

export enum TaskStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
}

export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

@Schema({ timestamps: true })
export class Task {
  @Prop({
    required: true,
    trim: true,
    maxlength: 200,
  })
  title: string;

  @Prop({
    default: '',
    trim: true,
    maxlength: 2000,
  })
  description: string;

  @Prop({
    type: String,
    enum: Object.values(TaskStatus),
    default: TaskStatus.PENDING,
  })
  status: TaskStatus;

  @Prop({
    type: String,
    enum: Object.values(TaskPriority),
    default: TaskPriority.MEDIUM,
  })
  priority: TaskPriority;

  @Prop({ type: Date, default: null })
  dueDate: Date | null;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  })
  userId: MongooseSchema.Types.ObjectId;
}

export const TaskSchema = SchemaFactory.createForClass(Task);

// Compound indexes for common filtered/sorted queries
TaskSchema.index({ userId: 1, status: 1 });
TaskSchema.index({ userId: 1, createdAt: -1 });

TaskSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});
