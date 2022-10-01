import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    if (!roles) {
      return true;
    }
    console.log(roles);
    const request = await context.switchToHttp().getRequest();
    const user = request.body;
    console.log(user);
    if (user.roles != 'admin') {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'You are not admin',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return roles.some((role) => user.roles?.includes(role));
  }
}
