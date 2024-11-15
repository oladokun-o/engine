import { Module } from '@nestjs/common';
import { SettingsController } from 'src/settings/settings.controller';
import { EmailService } from 'src/core/services/mailer.service';
import { SettingsService } from 'src/settings/settings.service';
import { Settings, SettingsSchema } from 'src/schemas/settings.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Settings.name, schema: SettingsSchema },
    ]),
  ],
  controllers: [SettingsController],
  providers: [SettingsService, EmailService],
  exports: [SettingsService, MongooseModule],
})
export class SettingsModule {}
