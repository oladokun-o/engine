import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestResponse } from '../core/interfaces/index.interface';
import { EmailService } from '../core/services/mailer.service';
import {
  ChangeAddressDto,
  ChangeLanguageDto,
  UpdateCommunicationPreferencesDto,
  updateProfileDto,
} from 'src/core/dto/settings.dto';
import { compare, hash } from 'bcrypt';
import { User } from '../schemas/user.schema';

@Injectable()
export class SettingsService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailerService: EmailService,
  ) {}

  /**
   * Change email address
   */
  async changeEmail(
    id: string,
    email: string,
    newEmail: string,
  ): Promise<RequestResponse | BadRequestException> {
    try {
      const user = await this.userModel.findOne({ _id: id, email });

      if (!user) {
        return { result: 'error', message: 'User not found', data: null };
      }

      if (user.email === newEmail) {
        throw new BadRequestException('Emails are the same');
      }

      const userWithEmailExists = await this.userModel.findOne({
        email: newEmail,
      });
      if (userWithEmailExists) {
        throw new BadRequestException('User with email already exists');
      }

      user.email = newEmail;
      user.settings.verified = false;
      await user.save();

      // Send welcome email
      const message = `Hello ${user.firstName}, your email address was successfully changed.`;
      if (user.settings.notificationsEmail)
        await this.mailerService.sendEmail(
          'support',
          user.email,
          'Your email address was changed',
          message,
        );

      return {
        result: 'success',
        message: 'Email updated successfully!',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to update email',
        data: null,
      };
    }
  }

  /**
   * Change phone number
   */
  async changePhoneNumber(
    userId: string,
    newPhoneNumber: string,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        return { result: 'error', message: 'User not found', data: null };
      }

      user.phone = newPhoneNumber;
      await user.save();

      // Send notification email
      const message = `Hello ${user.firstName}, your phone number was successfully changed.`;
      if (user.settings.notificationsEmail)
        await this.mailerService.sendEmail(
          'support',
          user.email,
          'Your phone number was changed',
          message,
        );

      return {
        result: 'success',
        message: 'Phone number updated successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to update phone number',
        data: null,
      };
    }
  }

  /**
   * Change address
   */
  async changeAddress(
    userId: string,
    payload: ChangeAddressDto,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.address = payload;
      await user.save();

      return {
        result: 'success',
        message: 'Address updated successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to update address',
        data: null,
      };
    }
  }

  /**
   * Update profile
   */
  async updateProfile(
    userId: string,
    profilePicture: Express.Multer.File,
    payload: updateProfileDto,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        return { result: 'error', message: 'User not found', data: null };
      }

      user.firstName = payload.firstName;
      user.middleName = payload.middlename || '';
      user.lastName = payload.lastName;

      if (profilePicture) {
        user.profilePicture = profilePicture.filename;
      }

      await user.save();

      return {
        result: 'success',
        message: 'Profile updated successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to update profile',
        data: null,
      };
    }
  }

  /**
   * Update communication preferences
   */
  async updateCommunicationPreferences(
    dto: UpdateCommunicationPreferencesDto,
    userId: string,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        return { result: 'error', message: 'User not found', data: null };
      }

      user.settings.notificationsEmail = dto.notificationsEmail;
      user.settings.notificationsSms = dto.notificationsSms;
      user.settings.securityTwoFactorAuth = dto.securityTwoFactorAuth;

      await user.save();

      return {
        result: 'success',
        message: 'Communication preferences updated successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to update communication preferences',
        data: null,
      };
    }
  }

  /**
   * Change password
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<RequestResponse | BadRequestException> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        return { result: 'error', message: 'User not found', data: null };
      }

      const isPasswordValid = await compare(currentPassword, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      user.password = await hash(newPassword, 10);
      await user.save();

      const message = `Hello ${user.firstName}, your password was successfully changed.`;
      if (user.settings.notificationsEmail)
        await this.mailerService.sendEmail(
          'support',
          user.email,
          'Your password was changed',
          message,
        );

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

  /**
   * Get user settings
   */
  async getSettings(userId: string): Promise<RequestResponse> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        result: 'success',
        message: 'User settings fetched successfully',
        data: user.settings,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || "Failed to fetch user's settings",
        data: null,
      };
    }
  }

  /**
   * Update language
   */
  async updateLanguage(
    userId: string,
    changeLanguageDto: ChangeLanguageDto,
  ): Promise<RequestResponse> {
    try {
      const user = await this.userModel.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.settings.language = changeLanguageDto.language;
      await user.save();

      return {
        result: 'success',
        message: 'Language changed successfully',
        data: null,
      };
    } catch (error) {
      return {
        result: 'error',
        message: error.message || 'Failed to change language',
        data: null,
      };
    }
  }
}
