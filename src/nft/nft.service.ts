import { Injectable } from '@nestjs/common';

@Injectable()
export class NftService {
  signup() {
    return { msg: 'I have signed Up' };
  }
  signin() {
    return { msg: 'I have signed in' };
  }
}
