import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Order } from './order.schema';
import { Payment } from './payment.schema';
import { Settings } from './settings.schema';
import { UserRole } from 'src/core/interfaces/user.interface';

export type UserDocument = User & Document;

@Schema()
export class User extends Document {
  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, nullable: true, default: null })
  middleName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: String, nullable: true, default: null })
  phone: string;

  @Prop({ type: String, nullable: true, default: null })
  profilePicture: string;

  @Prop({ type: String, nullable: true, default: null })
  addressStreet: string;

  @Prop({ type: String, nullable: true, default: null })
  addressCity: string;

  @Prop({ type: String, nullable: true, default: null })
  addressState: string;

  @Prop({ type: String, nullable: true, default: null })
  floor: string;

  @Prop({ type: String, nullable: true, default: null })
  zip_code: string;

  @Prop({ type: String, nullable: true, default: null })
  apartment_number: string;

  @Prop({ type: String, nullable: true, default: null })
  addressPostalCode: string;

  @Prop({ type: String, nullable: true, default: null })
  addressCountry: string;

  @Prop({ type: String, default: UserRole.CUSTOMER })
  role: UserRole;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Prop({ type: Date, nullable: true, default: null })
  lastLogin: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Order' }] })
  orders: Order[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Payment' }] })
  payments: Payment[];

  @Prop({ type: Settings, default: () => ({}) })
  settings: Settings;

  @Prop({ type: String, nullable: true, default: null })
  token: string;

  @Prop({ type: String, nullable: true, default: null })
  resetPasswordToken: string;

  get profilePictureUrl(): string | null {
    if (this.profilePicture) {
      return `${process.env.BACKEND_URL || 'https://qmemoirdrop.adaptable.app'}/uploads/${this.profilePicture}`;
    }
    return null;
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.virtual('profilePictureUrl').get(function () {
  if (this.profilePicture) {
    return `${process.env.BACKEND_URL || 'https://qmemoirdrop.adaptable.app'}/uploads/${this.profilePicture}`;
  }
  return null;
});
