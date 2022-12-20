import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
@ApiTags('subscription')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) { }

  async subscribeToPremium(): Promise<any> {
    // check user is registered or not
    //check for payment
    //gen a jwt token 
    //serialize the jwt token 
  }
}
