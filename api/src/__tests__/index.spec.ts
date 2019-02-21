import dotenv from 'dotenv';

// (this is only used for local testing, and doesn't exist in CI)
dotenv.config({
  silent: true,
  path: '../.env.test',
});

import { db, configureDatabase } from '../db';
import { configureRedis, redis } from '../redis';

before(async () => {
  configureDatabase();
  configureRedis();

  // reset schema and run all migrations
  await db!.raw('DROP SCHEMA public CASCADE;');
  await db!.raw('CREATE SCHEMA public;');
  await db!.migrate.latest();

  // reset redis
  await redis!.flushdb();
});

beforeEach(async () => {
  await db!.raw('BEGIN');
});

afterEach(async () => {
  await db!.raw('ROLLBACK');
});
