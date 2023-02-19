// import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
// import { Cache } from 'cache-manager';
// @Injectable()
// export class RedisCliService {
//   constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}
//   async setEx(key: string, value: string, ttl: number): Promise<any> {
//     console.log(key, 'setEx data  received', value);
//     await this.cacheManager.set(key, value);
//     return this.cacheManager.get(key);
//   }

//   async set(key: string, value: string): Promise<any> {
//     console.log(key, 'set data  received', value, key);
//     await this.cacheManager.set(key, value);
//     return this.cacheManager.get(key);
//   }

//   async getEx(key: string): Promise<any> {
//     console.log('get data from redis', key);
//     return await this.cacheManager.get(key);
//   }

//   async del(key: string): Promise<any> {
//     return await this.cacheManager.del(key);
//   }

//   async reset(): Promise<any> {
//     return await this.cacheManager.reset();
//   }
// }
