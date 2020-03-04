import '../util/loadDotEnv';

import { execSync } from 'child_process';
import * as path from 'path';
import { db, configureDatabase } from '../db';
import { configureRedis } from '../redis';

before(async function() {
  this.timeout(15000);

  execSync(path.resolve(__dirname, '../../../spec/bin/create_schema.sh'), {
    stdio: 'inherit',
    env: {
      DATABASE_URL: process.env.DATABASE_URL,
      JDBC_DATABASE_URL: process.env.JDBC_DATABASE_URL,
      REDIS_URL: process.env.REDIS_URL,
    },
  });

  configureDatabase();
  configureRedis();
});

beforeEach(async () => {
  await db!.raw('BEGIN');
});

afterEach(async () => {
  await db!.raw('ROLLBACK');
});
