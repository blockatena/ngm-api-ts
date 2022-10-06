import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthService } from 'src/jwt-auth/jwt-auth.service';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly jwtService: JwtAuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // This is meta data which we set in particular route we call
    // You need to specify the roles in the form of array
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    console.log('meta role', roles);
    // This context get use http request Object
    const request = await context.switchToHttp().getRequest();
    // Decoding the payload
    const user = await this.jwtService.Verify(request.params.jwt);
    const check = roles.some((role) => user.roles?.includes(role));
    if (check) {
      return true;
    } else {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: `This Route requires permission ${roles}`,
        },
        HttpStatus.FORBIDDEN,
      );
    }
  }
}
