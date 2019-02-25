import { Client } from 'pg';
import { parse } from 'pg-connection-string';
import dotenv from 'dotenv';

// (this is only used for local testing, and doesn't exist in CI)
dotenv.config({
  silent: true,
  path: '../.env.test',
});

import { db, configureDatabase } from '../db';
import { configureRedis, redis } from '../redis';

async function createTestDatabase(): Promise<void> {
  // create db if it doesn't already exist
  const connection = parse(process.env.DATABASE_URL!) as any;
  const client = new Client({
    ...connection,
    database: 'postgres',
  });

  await client.connect();
  const { rowCount } = await client.query(
    'SELECT 1 FROM pg_database WHERE datname = $1',
    [connection.database]
  );
  const dbExists = rowCount === 1;

  if (!dbExists) {
    await client.query(`CREATE DATABASE ${connection.database}`);
  }

  await client.end();
}

before(async () => {
  await createTestDatabase();

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
