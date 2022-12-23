import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { WelcomeMail } from './dto/email.dto';
const { log } = console;
@Injectable()
export class EmailService {
    constructor(private readonly configService: ConfigService, private readonly mailerService: MailerService
    ) { }

    async welcomeMail(sendMail: WelcomeMail): Promise<any> {
        const { recepient, subject, message } = sendMail;
        const { user_name, email_addr, wallet_address } = recepient;
        try {
            log()
            return await this
                .mailerService
                .sendMail({
                    to: email_addr,
                    from: await this.configService.get<string>('EMAIL_ADDR'),
                    subject: subject,
                    template: './welcome', // The `.pug` or `.hbs` extension is appended automatically.
                    context: {  // Data to be sent to template engine.
                        user_name,
                        wallet_address,
                        email_addr
                    },
                })
                .then((success) => {
                    console.log(success)
                })
                .catch((err) => {
                    console.log(err)
                });
        } catch (error) {
            log(error);
        }

    }
}
