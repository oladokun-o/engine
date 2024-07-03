// Create user dto
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Matches,
  MaxLength,
  MinLength,
  IsEnum,
  Validate,
  IsOptional,
} from 'class-validator';
import { Match } from '../decorators/match.decorator';
import { UserRole } from '../interfaces/user.interface';
import { Languages } from '../interfaces/index.interface';
import { IsRussianPhoneNumberConstraint } from '../../common/classes/custom-validator.class';

/**
 * Data transfer object for creating a user
 * @export CreateUserDto
 * @class CreateUserDto
 * @implements {CreateUserDto}
 */
export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  readonly firstName: string;

  @IsOptional()
  @IsString()
  readonly middlename: string;

  @IsString()
  @IsNotEmpty()
  readonly lastName: string;

  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/, {
    message: 'Password too weak',
  })
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  readonly password: string;

  @Match('password', { message: 'Passwords do not match' })
  @MinLength(4)
  @MaxLength(20)
  @IsString()
  @IsNotEmpty()
  readonly confirmPassword: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  readonly role: UserRole;

  @Validate(IsRussianPhoneNumberConstraint, {
    message: 'Phone number must be a valid Russian phone number!',
  })
  @IsNotEmpty()
  readonly phone: string;

  @IsEnum(Languages)
  @IsNotEmpty()
  readonly language: Languages;
}

/**
 * Data transfer object for verifying otp
 * @export VerifyOtpDto
 * @class VerifyOtpDto
 * @implements {VerifyOtpDto}
 */
export class VerifyOtpDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @MinLength(4)
  @MaxLength(4)
  @IsNotEmpty()
  readonly otp: string;
}

/**
 * Data transfer object for verifying otp
 * @export ResendVerificationOtpDto
 * @class ResendVerificationOtpDto
 * @implements {ResendVerificationOtpDto}
 */
export class ResendVerificationOtpDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}

/**
 * Data transfer object for logging in a user with email and password
 * @export LoginUserWithEmailDto
 * @class LoginUserWithEmailDto
 * @implements {LoginUserWithEmailDto}
 */
export class LoginUserWithEmailDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  readonly role: UserRole;
}

/**
 * Data transfer object for logging in a user with phone and password
 * @export LoginUserWithPhoneDto
 * @class LoginUserWithPhoneDto
 * @implements {LoginUserWithPhoneDto}
 */
export class LoginUserWithPhoneDto {
  @Validate(IsRussianPhoneNumberConstraint, {
    message: 'Phone number must be a valid Russian phone number!',
  })
  @IsNotEmpty()
  readonly phone: string;

  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @IsEnum(UserRole)
  @IsNotEmpty()
  readonly role: UserRole;
}

/**
 * Send password reset email
 */
export class SendPasswordResetEmailDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;
}

/**
 * Update password
 */
export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  readonly token: string;

  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/, {
    message: 'Password too weak',
  })
  @IsNotEmpty()
  @MinLength(4)
  @MaxLength(20)
  @IsString()
  readonly password: string;
}

/**
 * Change email address
 */
export class ChangeEmailDto {
  @IsEmail()
  @IsNotEmpty()
  readonly email: string;

  @IsEmail()
  @IsNotEmpty()
  readonly newEmail: string;
}
