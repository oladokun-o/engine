import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserModule } from './users/user.module';
import { Order } from './entities/order.entity';
import { Payment } from './entities/payment.entity';
import { Settings } from './entities/settings.entity';
import { VerificationOtp } from './entities/verify.entity';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SettingsModule } from './settings/settings.module';
import { OrdersModule } from './orders/orders.module';
import { Message } from './entities/message.entity';
import { MessageModule } from './messages/message.module';

const Modules = [
  AuthModule,
  UserModule,
  SettingsModule,
  OrdersModule,
  MessageModule,
];

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Order, Payment, Settings, VerificationOtp, Message],
      synchronize: true,
    }),
    ...Modules,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
