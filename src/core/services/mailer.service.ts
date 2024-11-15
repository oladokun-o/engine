import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  async sendEmail(
    user: 'team' | 'support' = 'team',
    to: string,
    subject: string,
    text: string,
  ) {
    // Create a Nodemailer transporter
    const transporter = nodemailer.createTransport({
      host: 'mail.qmemoir.com',
      port: 465,
      secure: true,
      auth: {
        user: user + '@qmemoir.com',
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Define email options
    const mailOptions = {
      from: user + '@qmemoir.com',
      to,
      subject,
      text,
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  }
}
