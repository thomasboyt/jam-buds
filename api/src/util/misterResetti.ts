import { Client } from 'pg';
import { parse } from 'pg-connection-string';

import { db, configureDatabase } from '../db';
import { configureRedis, redis } from '../redis';

async function recreateDatabase(): Promise<void> {
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

  if (dbExists) {
    console.log(`*** Recreating existing database ${connection.database}`);
    await client.query(`DROP DATABASE ${connection.database}`);
  } else {
    console.log(`*** Creating database ${connection.database}`);
  }

  await client.query(`CREATE DATABASE ${connection.database}`);

  await client.end();
}

interface ResettiOptions {
  disconnectAfterComplete?: boolean;
  runSeeds?: boolean;
}

export default async function misterResetti(opts: ResettiOptions) {
  await recreateDatabase();

  configureDatabase();
  configureRedis();

  console.log('*** Running migrations');
  await db!.migrate.latest();

  if (opts.runSeeds) {
    console.log('*** Running seeds');
    await db!.seed.run();
  }

  // reset redis
  console.log('*** Resetting Redis');
  await redis!.flushdb();

  if (opts.disconnectAfterComplete) {
    await db!.destroy();
    await redis!.disconnect();
  }
}
