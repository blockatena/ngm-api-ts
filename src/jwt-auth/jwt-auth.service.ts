import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
require('dotenv').config();

@Injectable()
export class JwtAuthService {
  constructor(private JWTService: JwtService) {}
  async Sign(payload: any): Promise<any> {
    return await this.JWTService.signAsync(payload);
  }

  async Verify(token: string): Promise<any> {
    return await this.JWTService.verifyAsync(token, {
      secret: process.env.mysecret,
    });
  }
}
