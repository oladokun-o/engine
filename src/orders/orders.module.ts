// import { Module } from '@nestjs/common';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { EmailService } from 'src/core/services/mailer.service';
// import { User } from 'src/entities/user.entity';
// import { OrdersController } from './orders.controller';
// import { OrdersService } from './orders.service';
// import { Order } from 'src/schemas/order.schema';
// import { MessageService } from 'src/messages/message.service';
// import { Message } from 'src/schemas/message.schema';

// const Repositories = TypeOrmModule.forFeature([User, Order, Message]);

// @Module({
//   imports: [Repositories],
//   controllers: [OrdersController],
//   providers: [OrdersService, EmailService, MessageService],
//   exports: [OrdersService, Repositories],
// })
// export class OrdersModule {}
