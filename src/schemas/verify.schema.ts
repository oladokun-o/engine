import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type VerificationOtpDocument = VerificationOtp & Document;

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: false } })
export class VerificationOtp {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  otp: string;

  @Prop({ default: false })
  verified: boolean;

  @Prop({ type: Date, default: Date.now })
  created_at: Date;

  @Prop({ type: Date, required: true })
  expires_at: Date;
}

export const VerificationOtpSchema =
  SchemaFactory.createForClass(VerificationOtp);
