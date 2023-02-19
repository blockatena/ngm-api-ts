import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, UserBody } from './dto/user.dto';
import { SubscriptionService } from './subscription.service';
const { log } = console;
@ApiTags('API Key Management')
@Controller('subscription')
export class SubscriptionController {
  constructor(
    private readonly subscriptionService: SubscriptionService,
  ) { }
  @ApiHeader({
    name: 'SECRET',
    description: 'Secret of the Enterprise for creating an API key'
  })
  @ApiOperation({ summary: 'This Route will create a Api key' })
  @Post('create-api-key')
  async subscribeToPremium(@Headers('SECRET') SECRET: string, @Body() body: User): Promise<any> {
    try {
      return await this.subscriptionService.subscribeToPremium({ SECRET, body });
    } catch (error) {

    }
  }

  @ApiOperation({ summary: "Increse Limit" })
  @ApiHeader({
    name: 'SECRET',
    description: 'Secret of the Enterprise for creating an API key'
  })
  @Post('increse-limit')
  async increseLimit(@Headers('SECRET') SECRET: string, @Body() body: UserBody,): Promise<any> {
    try {

      return await this.subscriptionService.increseLimit({ SECRET, body });

    } catch (error) {
      log(error);
      return {
        message: 'something went wrong',
        error,
      }
    }

  }
}


