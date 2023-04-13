import { MailerService } from '@nestjs-modules/mailer';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SendApiKey, WelcomeMail } from './dto/email.dto';
const { log } = console;
// implements OnModuleInit
@Injectable()
export class EmailService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) { }


  // async onModuleInit() {
  //   // const mail="vinay@blockatena.com";
  //   const mail = "sathyaswaroopvandavasi@gmail.com";

  //   const obj = {
  //     recepient: {
  //       email_addr: mail,
  //       user_name: "Vinay",
  //       wallet_address: "0xa8E7CCE298F1C2e52DE6920840d80C28Fc787F72",
  //     },
  //     subject: "Welcome",
  //     message: "we will meet soon",
  //   }
  //   await this.welcomeMail(obj);
  // }

  async welcomeMail(sendMail: WelcomeMail): Promise<any> {
    const { recepient, subject, message } = sendMail;
    const { user_name, email_addr, wallet_address } = recepient;
    try {
      log(sendMail);
      return await this.mailerService
        .sendMail({
          to: email_addr,
          from: this.configService.get<string>('EMAIL_ADDR'),
          subject: subject,
          template: './welcomenew', // The `.pug` or `.hbs` extension is appended automatically.
          context: {
            // Data to be sent to template engine.
            user_name,
            wallet_address,
            email_addr,
          },
        })
        .then((success) => {
          console.log(success);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      log(error);
    }
  }
  async sendApiKey(sendAPIKey: SendApiKey): Promise<any> {
    const { user_name, subject, wallet_address, email_addr, api_key } =
      sendAPIKey;
    // const { user_name, email_addr, wallet_address } = recepient;
    try {

      return await this.mailerService
        .sendMail({
          to: email_addr,
          from: this.configService.get<string>('EMAIL_ADDR'),
          subject,
          template: './sendapikey',
          // The `.pug` or `.hbs` extension is appended automatically.
          context: {
            // Data to be sent to template engine.
            user_name,
            wallet_address,
            api_key,
          },
        })
        .then((success) => {
          console.log(success);
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      log(error);
    }
  }
}
