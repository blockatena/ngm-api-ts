import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';
import { SendMail } from './dto/email.dto';
import { ConfigService } from '@nestjs/config';

@ApiTags('Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService, private configService: ConfigService,
  ) { }
  // 
  private EMAIL = this.configService.get<any>('EMAIL');

  // 

  @ApiOperation({ summary: 'send email' })
  @Post('send-email')
  async sendEmail(@Body() body: SendMail): Promise<any> {
    const { log } = console;
    const { recepient, subject, message } = body;
    console.log(this.EMAIL);
    try {
      const transporter = await nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        secure: true,
        auth: {
          user: this.EMAIL.EMAIL_ADDR,
          pass: this.EMAIL.EMAIL_PASSWORD,
        }
      })
      const response = await transporter.sendMail({
        from: this.EMAIL.EMAIL_ADDR,
        to: recepient,
        subject: subject,
        html: `<h1>Welcome to Blocaktena</h1>
        <b>${message}</b>`
      })
      log(response);
      return this.EMAIL;
    } catch (error) {
      log(error);
      return {
        error
      }
    }
  }
}
