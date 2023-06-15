import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/core/users/users.service';
const { log } = console;
@Injectable()
export class APIGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @Inject(UsersService) private readonly userService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = await context.switchToHttp().getRequest();

    const api_key = request?.headers['x-api-header'];

    if (!api_key) {
      return false;
    }
    // for deployment owner_addresss , for minting token_owner
    const token_owner =
      request?.body?.wallet_address || request?.body?.owner_address;
    // check api key if that api key matches the requrirements
    const owner_info = await this.userService.getUser({
      wallet_address: token_owner,
    });

    if (api_key === owner_info?.api_key) {
      log('API KEY IS CORRECT');
      request.body.limit = owner_info?.limit;
      return true;
    } else {
      log(request?.body);
      throw new HttpException(
        {
          message: `Hello ${token_owner} PROTECTED BY GUARDS`,
          status: HttpStatus.FORBIDDEN,
          error: 'error',
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
