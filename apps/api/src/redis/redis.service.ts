import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

// configure how long should the api response live in the cache
const ttl = 86400;

@Injectable()
export class RedisService implements OnModuleDestroy, OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor(private readonly configService: ConfigService) {
    this.client = createClient({
      url:
        this.configService.get<string>('REDIS_URL') ?? 'redis://localhost:6379', // redis is predefined in env, if not use default
    });

    this.client.on('error', (err: Error) => {
      this.logger.error(`Redis error: ${err.message}`);
    });
  }
  // connect redis
  async onModuleInit(): Promise<void> {
    await this.client.connect();
  }
  // close redis
  async onModuleDestroy(): Promise<void> {
    await this.client.quit();
  }

  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.client.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  async setJson(key: string, value: unknown) {
    await this.client.set(key, JSON.stringify(value), { EX: ttl });
  }
}
