import '../util/loadDotEnv';

import { execSync } from 'child_process';
import * as path from 'path';
import { db, configureDatabase } from '../db';
import { redis, configureRedis } from '../redis';

before(async function() {
  this.timeout(30000);

  const dbUrl =
    process.env.JDBC_DATABASE_URL ||
    'jdbc:postgresql://localhost:5433/jambuds_test?user=postgres&password=';

  const cmd = `./gradlew flywayClean flywayMigrate -Dflyway.url="${dbUrl}" --console=plain`;

  execSync(cmd, {
    stdio: 'inherit',
    cwd: path.resolve(__dirname, '../../../rhiannon'),
  });

  configureDatabase();
  configureRedis();
  await redis!!.flushdb();
});

beforeEach(async () => {
  await db!.raw('BEGIN');
});

afterEach(async () => {
  await db!.raw('ROLLBACK');
});
