import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UsersService } from 'src/users/users.service';
// import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';
const { log } = console;
@Injectable()
export class APIGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    // private readonly jwtService: JwtAuthService,
    //  private userService: UsersService
    @Inject(UsersService) private readonly userService: UsersService
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = await context.switchToHttp().getRequest();
    // log("ss",);
    const api_key = request?.headers['x-api-header'];
    log(api_key);
    if (!api_key) {
      return false;
    }
    // for deployment owner_addresss , for minting token_owner
    const token_owner = request?.body?.token_owner || request?.body?.owner_address;
    log(token_owner);
    // check api key if that api key matches the requrirements
    const owner_info = await this.userService.getUser(token_owner);
    // log(owner_info?.limit);
    if (api_key === owner_info?.api_key) {
      log('API KEY IS CORRECT')
      request.body.limit = owner_info?.limit;
      return true;
    } else {
      throw new HttpException(
        {
          message: `Hello ${token_owner}`,
          status: HttpStatus.FORBIDDEN,
          error: 'error'
          // error: `This Route requires permission ${roles}`,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
