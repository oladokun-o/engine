/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/schemas/user.schema';
import {
  VerificationOtp,
  VerificationOtpDocument,
} from 'src/schemas/verify.schema';
import { RequestResponse } from '../core/interfaces/index.interface';
import { CreateUserDto, SendPasswordResetEmailDto } from '../core/dto/user.dto';
import { EmailService } from '../core/services/mailer.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mailerService: EmailService,
    @InjectModel(VerificationOtp.name)
    private otpModel: Model<VerificationOtpDocument>,
    private jwtService: JwtService,
  ) {}

  /**
   *  Find all users
   * @returns {Promise<RequestResponse>}
   */
  async findAll(): Promise<RequestResponse> {
    try {
      const users = await this.userModel.find().exec();
      return {
        result: 'success',
        message: 'Users fetched successfully',
        data: users.map((u) => {
          return { ...u.toObject(), profilePicture: u.profilePictureUrl };
        }),
      };
    } catch (error) {
      throw new Error('Failed to fetch users.');
    }
  }

  /**
   * Find a user by id
   * @param id
   * @returns
   */
  async findOneById(id: string): Promise<RequestResponse> {
    try {
      const user = await this.userModel.findById(id).exec();
      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      const userObject = {
        ...user.toObject(),
        profilePicture: user.profilePictureUrl,
      };

      return {
        result: 'success',
        message: 'User fetched successfully',
        data: { ...userObject, password: undefined },
      };
    } catch (error) {
      throw new Error('Failed to fetch user.');
    }
  }

  /**
   * Find a user by email
   * @param email
   * @returns
   */
  async findOneByEmail(email: string): Promise<RequestResponse> {
    try {
      const user = await this.userModel.findOne({ email }).exec();
      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }
      const userObject = {
        ...user.toObject(),
        profilePicture: user.profilePictureUrl,
      };

      return {
        result: 'success',
        message: 'User fetched successfully',
        data: { ...userObject, password: undefined },
      };
    } catch (error) {
      throw new Error('Failed to fetch user.');
    }
  }

  /**
   * Create a new user
   * @param createUserDto
   * @returns {Promise<RequestResponse>}
   */
  async create(createUserDto: CreateUserDto): Promise<RequestResponse> {
    try {
      // check if user with email already exists
      const userWithEmailExists = await this.userModel
        .findOne({
          email: createUserDto.email,
        })
        .exec();

      if (userWithEmailExists) {
        return {
          result: 'error',
          message: 'User with email already exists',
          data: null,
        };
      }

      // check if user with phone number already exists
      // const userWithPhoneExists = await this.userModel
      //   .findOne({
      //     phone: createUserDto.phone,
      //   })
      //   .exec();

      // if (userWithPhoneExists) {
      //   return {
      //     result: 'error',
      //     message: 'User with phone number already exists',
      //     data: null,
      //   };
      // }

      const { confirmPassword, ...rest } = createUserDto;

      if (createUserDto.password !== confirmPassword) {
        return {
          result: 'error',
          message: 'Passwords do not match',
          data: null,
        };
      }

      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      const user = new this.userModel({
        ...rest,
        password: hashedPassword,
      });
      await user.save();

      // Send welcome email to user
      const message = `Welcome to our platform, ${createUserDto.firstName}!`;
      await this.mailerService.sendEmail(
        'support',
        createUserDto.email,
        'Welcome to qmemoirdrop!',
        message,
      );

      // Generate OTP for user verification and send it to the user
      const otpResponse = await this.generateOtp(createUserDto.email);

      if (otpResponse.result === 'error') {
        // Handle error generating OTP
        return otpResponse;
      }

      return {
        result: 'success',
        message: 'User created successfully',
        data: user,
      };
    } catch (error) {
      console.log(error);
      return {
        result: 'error',
        message: error.message || 'Failed to create user',
        data: null,
      };
    }
  }

  /**
   * Generate 4 pin otp for user verification, save it to the database, and send it to the user
   * @param {string} email
   * @returns {Promise<RequestResponse>}
   * @memberof UserService
   * @todo Implement this method
   */
  async generateOtp(email: string, resend?: boolean): Promise<RequestResponse> {
    try {
      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      const otp = Math.floor(1000 + Math.random() * 9000).toString();
      const oldOtp = await this.otpModel.findOne({ userId: user._id }).exec();
      if (oldOtp && resend) {
        await this.otpModel.deleteOne({ _id: oldOtp._id }).exec();
      }

      // Set the expiration date 5 minutes from now
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Include the expiration date in the new OTP document
      const newOtp = new this.otpModel({
        userId: user._id,
        otp,
        expires_at: expiresAt,
      });
      await newOtp.save();

      const message = `Your verification code is ${otp}. \nThis code expires in 5 minutes.`;
      await this.mailerService.sendEmail(
        'support', // sender
        user.email, // recipient
        'Verification Code', // subject
        message, // message
      );

      return {
        result: 'success',
        message: 'OTP generated successfully',
        data: {
          userId: user._id,
          expires_at: newOtp.expires_at,
        },
      };
    } catch (error) {
      console.log(error);
      return {
        result: 'error',
        message: error.message || 'Failed to generate OTP',
        data: null,
      };
    }
  }

  /**
   * Verify user OTP
   * @param {string} email
   * @param {string} otp
   * @returns {Promise<RequestResponse>}
   * @memberof UserService
   * @todo Implement this method
   */
  async verifyOtp(email: string, otp: string): Promise<RequestResponse> {
    try {
      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      if (user.settings && user.settings.verified) {
        return {
          result: 'error',
          message: 'User is already verified',
          data: null,
        };
      }

      const otpRecord = await this.otpModel
        .findOne({
          userId: user._id,
          otp,
        })
        .exec();

      if (!otpRecord) {
        return {
          result: 'error',
          message: 'Invalid OTP',
          data: null,
        };
      }

      const currentTime = new Date();
      if (otpRecord.expires_at.getTime() < currentTime.getTime()) {
        return {
          result: 'error',
          message: 'OTP has expired',
          data: null,
        };
      }

      // Update user verification status
      user.settings.verified = true;
      await user.save();

      // Delete the OTP record
      await this.otpModel.deleteOne({ _id: otpRecord._id }).exec();

      return {
        result: 'success',
        message: 'OTP verified successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to verify OTP',
        data: null,
      };
    }
  }

  // reset password by sending a reset email
  /**
   * Reset user password
   * @param {SendPasswordResetEmailDto} payload
   */
  async resetPassword(
    payload: SendPasswordResetEmailDto,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userModel
        .findOne({ email: payload.email })
        .exec();

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      const otpResponse = await this.generateResetToken(payload);

      if (otpResponse.result === 'error') {
        return otpResponse;
      }

      return {
        result: 'success',
        message: 'Password reset email sent successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to reset password',
        data: null,
      };
    }
  }

  /**
   * Generate token for reset password
   * @param {SendPasswordResetEmailDto} payload
   * @param {boolean}
   * @returns {Promise<RequestResponse>}
   */
  async generateResetToken(
    payload: SendPasswordResetEmailDto,
    resend?: boolean,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userModel
        .findOne({ email: payload.email })
        .exec();

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      const payloadToken = { email: user.email, userId: user._id };

      const token = this.jwtService.sign(payloadToken, {
        expiresIn: '1d',
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
      });

      const message = `
        <h3>Hello, ${user.firstName}</h3>
        <p>You've requested to reset your password. Please use the link below to reset your password.</p>
        <p><a href="http://localhost:3000/auth/reset-password?token=${token}">Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
      `;

      await this.mailerService.sendEmail(
        'support',
        user.email,
        'Password Reset Request',
        message,
      );

      return {
        result: 'success',
        message: 'Reset token generated successfully',
        data: token,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to generate reset token',
        data: null,
      };
    }
  }

  /**
   * Validate reset password token
   * @param {string} token
   * @returns {Promise<RequestResponse>}
   */
  async validateResetToken(token: string): Promise<RequestResponse> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
      });

      if (!payload) {
        return {
          result: 'error',
          message: 'Invalid token',
          data: null,
        };
      }

      const user = await this.userModel.findById(payload.userId).exec();

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      return {
        result: 'success',
        message: 'Token validated successfully',
        data: user,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to validate token',
        data: null,
      };
    }
  }

  /**
   * Update user password
   * @param {string} userId
   * @param {string} password
   * @returns {Promise<RequestResponse>}
   */
  async updatePassword(
    email: string,
    password: string,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userModel.findOne({ email }).exec();

      if (!user) {
        return {
          result: 'error',
          message: 'User not found',
          data: null,
        };
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await user.save();

      return {
        result: 'success',
        message: 'Password updated successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to update password',
        data: null,
      };
    }
  }
}
