import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from 'src/users/user.controller';
import { EmailService } from 'src/core/services/mailer.service';
import { UserService } from 'src/users/user.service';
import { User, UserSchema } from 'src/schemas/user.schema';
import {
  VerificationOtp,
  VerificationOtpSchema,
} from 'src/schemas/verify.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: VerificationOtp.name, schema: VerificationOtpSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, EmailService, JwtService],
  exports: [UserService, MongooseModule],
})
export class UserModule {}
