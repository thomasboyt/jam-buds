import knex from 'knex';
import path from 'path';
import childProcess from 'child_process';
import dotenv from 'dotenv';
import waitPort from 'wait-port';

if (!process.env.CI) {
  dotenv.config({
    path: '../.env.test',
  });
}

async function resetDb() {
  const db = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL,
  });

  try {
    await db!.raw('DROP SCHEMA public CASCADE;');
    await db!.raw('CREATE SCHEMA public;');

    await db!.migrate.latest({
      directory: '../api/migrations',
    });

    await db!.seed.run({
      directory: '../api/seeds',
    });
  } catch (err) {
    throw err;
  } finally {
    db!.destroy();
  }
}

function waitForStart(ms: number): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
}

before(async function() {
  this.timeout(30 * 1000);

  console.log('Starting API server');

  // this uses a node entry point instead of ts-node cuz i couldn't easily clean
  // up after ts-node exited
  const child = childProcess.spawn('npm', ['start'], {
    cwd: path.join(__dirname, '../../api'),
    stdio: 'inherit',
  });

  process.on('exit', () => {
    child.kill();
  });

  console.log('Waiting for API server start');
  const started = await waitPort({
    port: parseInt(process.env.PORT!),
    timeout: 10 * 1000,
  });

  if (!started) {
    throw new Error('timed out :(');
  }
});

beforeEach(async () => {
  await resetDb();
});
