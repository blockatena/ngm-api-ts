import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
@Injectable()
export class redisCacheManger {
  constructor(@Inject(CACHE_MANAGER) private Cacheservice: Cache) {}

  async setEx(key: string, value: string): Promise<any> {
    console.log(key, 'data  received', value);
    return await this.Cacheservice.set(key, value, 6000);
  }

  async getEx(key: string): Promise<any> {
    console.log('get data from redis', key);
    return await this.Cacheservice.get(key);
  }

  async del(key: string): Promise<any> {
    return await this.Cacheservice.del(key);
  }

  async reset(): Promise<any> {
    return await this.Cacheservice.reset();
  }
}
