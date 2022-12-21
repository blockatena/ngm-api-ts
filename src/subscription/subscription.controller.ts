import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from 'src/users/users.service';
import { UserBody } from './dto/user.dto';
import { SubscriptionService } from './subscription.service';
import { generateApiKey } from 'generate-api-key';
const { log } = console;
@ApiTags('subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService,
    private userService: UsersService) { }
  @ApiOperation({ summary: 'To subscribe for premium services' })
  @Post('subscribe')
  async subscribeToPremium(@Body() body: UserBody): Promise<any> {
    const { wallet_address, email } = body;
    try {
      // check user is registered or not
      const check_user_exists = await this.userService.getUser(wallet_address);
      log(check_user_exists);
      // check Api key exists already  or not 
      //check for payment
      //gen a jwt token 
      if (!check_user_exists.api_key) {
        const api_key = generateApiKey({ method: 'uuidv4', dashes: true, min: 32, max: 32, name: `${check_user_exists.wallet_address}${check_user_exists}` });
        log("New Subscriber Thankyou Your API key is", api_key);
        // store api key
        const store_api_key = await this.userService.updateUser(wallet_address, { api_key });
      }


      //  get transaction details also , means how much amount of maticc is cut or how much amount is decresed based on that we need to provide limit ,because there might be case that limit may be 22222 but amount paid is less
      // limit
      const limit = await this.userService.increseLimit(wallet_address, 5);
      console.log(limit);
      // serialize the jwt token 
      // Welcome Mail
      return limit;

    } catch (error) {
      log(error);
      return {
        error,
      }
    }
  }
}
