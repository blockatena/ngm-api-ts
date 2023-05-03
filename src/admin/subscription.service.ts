import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/services/email.service';
import { User, UserBody } from './dto/user.dto';
import { log } from 'console';
import generateApiKey from 'generate-api-key';
import { UsersService } from 'src/core/users/users.service';
import { SendAPiKey } from './dto/sendapikey.dto';

@Injectable()
export class SubscriptionService {
  constructor(
    private userService: UsersService,
    private emailService: EmailService,
    private configservice: ConfigService,
  ) { }

  async subscribeToPremium({
    SECRET,
    body,
  }: {
    SECRET: string;
    body: User;
  }): Promise<any> {
    const { wallet_address, email } = body;
try{
    const secret = this.configservice.get<string>('ADMIN_SECRET');

    if (!(secret === SECRET)) {
      return `Invalid Secret Ask Admin for Secret`;
    }

    const checkUserExists = await this.userService.getUser({ wallet_address });

    if (!checkUserExists)
      throw new NotFoundException(
        {
          description: `There is no user with wallet ${wallet_address} is registered with us kindly register`,
        },
        'USER NOT FOUND',
      );

    if (!(email === checkUserExists.email))
      throw new BadRequestException(
        {
          cause: new Error(),
          description: 'Some error description',
        },
        `The wallet  ${wallet_address} is  not linked to ${email}`,
      );

    if (!checkUserExists.api_key) {
      const api_key = generateApiKey({
        method: 'uuidv4',
        dashes: true,
        min: 32,
        max: 32,
        name: `${checkUserExists.wallet_address}${checkUserExists}`,
      });

      await this.userService.updateUser(wallet_address, {
        api_key,
      });

      return {
        message: `Successfully Generated the Api Key for User ${wallet_address}`,
      };
    } else {
      return `You already have an Api key if you want to change your API key contact hello@blockatena.com`;
    }
  }
  catch(error){
    console.log(error);
    return{
      message:`Unable to Create API Key ,Please Raise Issue to gamestoweb3@gmail.com`,
      error
    }
  }
  }

  async increseLimit({
    SECRET,
    body,
  }: {
    SECRET: string;
    body: UserBody;
  }): Promise<any> {
    const { wallet_address, email, increse_limit } = body;
    const { collections_limit, asset_limit } = increse_limit;
    try {
      const ADMIN_SECRET = this.configservice.get<string>('ADMIN_SECRET');

      if (!(ADMIN_SECRET === SECRET)) {
        return `Invalid Secret , Ask Admin for Secret`;
      }
      // check user is registered or not
      const check_user_exists = await this.userService.getUser({
        wallet_address,
      });
      log(check_user_exists);
      if (!check_user_exists)
        return `There is no user with wallet ${wallet_address} is registered with us kindly register`;
      // check user is wallet is linked to provided mail
      if (!(email === check_user_exists.email))
        return `The wallet  ${wallet_address} is  not linked to ${email}`;

      // increse Limit
      return await this.userService.increseLimit(
        wallet_address,
        collections_limit,
        asset_limit,
      );
    } catch (error) {
      log(error);
    }
  }

  async sendApiKeyToMail({
    SECRET,
    body,
  }: {
    SECRET: string;
    body: SendAPiKey;
  }): Promise<any> {

    const { wallet_address } = body;
    const ADMIN_SECRET= this.configservice.get<string>('ADMIN_SECRET');
    if (!(ADMIN_SECRET === SECRET)) {
      return `Invalid Secret , Ask Admin for Secret`;
    }
    //validate user
    const isUserRegistered = await this.userService.getUser({ wallet_address });
    if (!isUserRegistered) {
      return {
        success: true,
        message: `${wallet_address} is not registered with us.`
      }
    }
    const { email, user_name, api_key } = isUserRegistered;
    const mailObj = {
      email_addr: email,
      user_name,
      wallet_address,
      api_key,
      subject: "API Key Request"
    }

    return await this.emailService.sendApiKey(mailObj);
  }

}
