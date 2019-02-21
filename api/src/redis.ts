import Redis from 'ioredis';

export let redis: Redis.Redis | undefined;

export function configureRedis() {
  if (!process.env.REDIS_URL) {
    throw new Error('cannot create Redis instance: missing REDIS_URL env var');
  }

  redis = new Redis(process.env.REDIS_URL);
}
