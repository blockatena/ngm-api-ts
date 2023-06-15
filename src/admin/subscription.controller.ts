import { Body, Controller, Headers, Post } from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, UserBody } from './dto/user.dto';
import { SubscriptionService } from './subscription.service';
import { SendAPiKey } from './dto/sendapikey.dto';
const { log } = console;
@ApiTags('API Key Management')
@Controller('subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}
  @ApiHeader({
    name: 'SECRET',
    description: 'Secret of the Enterprise for creating an API key',
  })
  @ApiOperation({ summary: 'This Route will create a Api key' })
  @Post('create-api-key')
  async subscribeToPremium(
    @Headers('SECRET') SECRET: string,
    @Body() body: User,
  ): Promise<any> {
    return await this.subscriptionService.subscribeToPremium({ SECRET, body });
  }

  @ApiOperation({ summary: 'Increse Limit' })
  @ApiHeader({
    name: 'SECRET',
    description: 'Secret of the Enterprise for creating an API key',
  })
  @Post('increse-limit')
  async increseLimit(
    @Headers('SECRET') SECRET: string,
    @Body() body: UserBody,
  ): Promise<any> {
    try {
      return await this.subscriptionService.increseLimit({ SECRET, body });
    } catch (error) {
      log(error);
      return {
        message: 'something went wrong',
        error,
      };
    }
  }

  @ApiHeader({
    name: 'SECRET',
    description: 'Secret of the Enterprise for creating an API key',
  })
  @Post('send-api-key')
  async sendApiKey(
    @Headers('SECRET') SECRET: string,
    @Body() body: SendAPiKey,
  ): Promise<any> {
    try {
      return await this.subscriptionService.sendApiKeyToMail({ SECRET, body });
    } catch (error) {
      console.log(error);
      return {
        message: 'Unable to Send API Key ,Please Raise Issue',
        error,
      };
    }
  }
}
