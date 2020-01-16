import Redis from 'ioredis';
import config from './config';

export let redis: Redis.Redis | undefined;

export function configureRedis() {
  redis = new Redis(config.get('REDIS_URL'));
}
