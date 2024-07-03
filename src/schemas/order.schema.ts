import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Message } from './message.schema';
import { OrderStatus } from 'src/core/interfaces/orders.interface';

export type OrderDocument = Order & Document;

@Schema()
export class Order {
  @Prop({
    type: String,
    enum: OrderStatus,
    default: OrderStatus.Pending,
    required: true,
  })
  status: OrderStatus;

  @Prop({ type: Object, required: true })
  location: Record<string, any>;

  @Prop({ type: Object, required: true })
  details: Record<string, any>;

  @Prop({ type: Object, required: true })
  payment: Record<string, any>;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  courier: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;

  @Prop([{ type: Types.ObjectId, ref: 'Message' }])
  messages: Message[];
}

export const OrderSchema = SchemaFactory.createForClass(Order);
