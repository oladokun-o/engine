import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Order } from './order.schema';
import { Payment } from './payment.schema';
import { Settings } from './settings.schema';
import { UserRole } from 'src/core/interfaces/user.interface';

@Schema()
export class Address {
  @Prop({ type: String, nullable: true, default: null })
  street: string;

  @Prop({ type: String, nullable: true, default: null })
  city: string;

  @Prop({ type: String, nullable: true, default: null })
  state: string;

  @Prop({ type: String, nullable: true, default: null })
  postalCode: string;

  @Prop({ type: String, nullable: true, default: null })
  country: string;

  @Prop({ type: String, nullable: true, default: null })
  floor: string;

  @Prop({ type: String, nullable: true, default: null })
  zipCode: string;

  @Prop({ type: String, nullable: true, default: null })
  apartmentNumber: string;
}

export const AddressSchema = SchemaFactory.createForClass(Address);

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

  @Prop({ type: AddressSchema, default: () => ({}) })
  address: Address;

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
