import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SettingsDocument = Settings & Document;

@Schema()
export class Settings {
  @Prop({ type: String, default: 'en' })
  language: string;

  @Prop({ type: Boolean, default: true })
  notificationsEmail: boolean;

  @Prop({ type: Boolean, default: false })
  notificationsSms: boolean;

  @Prop({ type: Boolean, default: false, nullable: true })
  securityTwoFactorAuth: boolean;

  @Prop({ type: Boolean, default: false })
  verified: boolean;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
