import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

@Schema()
export class Payment {
  @Prop({ type: Date, required: true })
  date: Date;

  @Prop({ type: Number, required: true })
  amount: number;

  @Prop({
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    required: true,
  })
  status: 'pending' | 'completed' | 'failed' | 'refunded' | 'cancelled';

  @Prop({ type: String, required: true })
  orderId: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
