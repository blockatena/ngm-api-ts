import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/services/email.service';
import { UsersService } from 'src/users/users.service';
import { User, UserBody } from './dto/user.dto';
import { log } from 'console';
import generateApiKey from 'generate-api-key';

@Injectable()
export class SubscriptionService {
    constructor(
        private userService: UsersService,
        private emailService: EmailService,
        private configservice: ConfigService) { }

    async subscribeToPremium({ SECRET, body }: { SECRET: string; body: User }): Promise<any> {
        const { wallet_address, email } = body;
        try {

            const secret = this.configservice.get<string>('ADMIN_SECRET');

            if (!(secret === SECRET)) {
                return `Invalid Secret ask admin for Key`
            }

            const checkUserExists = await this.userService.getUser({ wallet_address });

            if (!checkUserExists)
                return new NotFoundException({ description: `There is no user with wallet ${wallet_address} is registered with us kindly register` }, "USER NOT FOUND");

            if (!(email === checkUserExists.email))
                throw new BadRequestException({
                    cause: new Error(),
                    description: 'Some error description'
                }, `The wallet  ${wallet_address} is  not linked to ${email}`,)


            if (!checkUserExists.api_key) {

                const api_key = generateApiKey({ method: 'uuidv4', dashes: true, min: 32, max: 32, name: `${checkUserExists.wallet_address}${checkUserExists}` });

                const store_api_key = await this.userService.updateUser(wallet_address, { api_key });

                return {
                    message: `Successfully Generated the Api Key for User ${wallet_address}`,
                    apiKey: store_api_key,
                }

            }
            else {
                return `You already have an Api key if you want to change your API key contact hello@blockatena.com`
            }
        } catch (error) {
            return error
        }
    }

    async increseLimit({ SECRET, body }: { SECRET: string; body: UserBody }): Promise<any> {
        const { wallet_address, email, increse_limit } = body;
        const { collections_limit, asset_limit } = increse_limit
        try {

            const secret = this.configservice.get<string>('ADMIN_SECRET');

            if (!(secret === SECRET)) {

            }
            // check user is registered or not
            const check_user_exists = await this.userService.getUser({ wallet_address });
            log(check_user_exists);
            if (!check_user_exists)
                return `There is no user with wallet ${wallet_address} is registered with us kindly register`;
            // check user is wallet is linked to provided mail 
            if (!(email === check_user_exists.email))
                return `The wallet  ${wallet_address} is  not linked to ${email}`;

            // increse Limit
            return await this.userService.increseLimit(wallet_address, collections_limit, asset_limit)

        } catch (error) {
            log(error);
            return {
                success: false,
                message: 'Something Went Wrong',
                error
            }

        }
    }
}
