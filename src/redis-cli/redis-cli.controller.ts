import { Controller } from '@nestjs/common';
import { RedisCliService } from './redis-cli.service';

@Controller('redis-cli')
export class RedisCliController {
  constructor(private readonly redisCliService: RedisCliService) {}
}
