import { Client } from 'pg';
import { parse } from 'pg-connection-string';

import { db, configureDatabase } from '../db';
import { configureRedis, redis } from '../redis';
import seed from '../../seeds';

async function createDatabase(): Promise<void> {
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
    console.log(`*** Creating database ${connection.database}`);
    await client.query(`CREATE DATABASE ${connection.database}`);
  }

  await client.end();
}

interface ResettiOptions {
  disconnectAfterComplete?: boolean;
  runSeeds?: boolean;
}

export default async function misterResetti(opts: ResettiOptions) {
  await createDatabase();

  configureDatabase();
  try {
    await db!.raw('DROP SCHEMA public CASCADE;');
  } catch (err) {
    // surpress error since it usually just means the schema already exists, but
    // log in case of weirdness
    console.log(err.message);
  }

  await db!.raw('CREATE SCHEMA public;');

  configureRedis();

  console.log('*** Running migrations');
  await db!.migrate.latest();

  if (opts.runSeeds) {
    console.log('*** Running seeds');
    await seed();
  }

  // reset redis
  console.log('*** Resetting Redis');
  await redis!.flushdb();

  if (opts.disconnectAfterComplete) {
    await db!.destroy();
    await redis!.disconnect();
  }
}
