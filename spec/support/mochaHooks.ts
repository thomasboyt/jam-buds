import knex from 'knex';
import path from 'path';
import childProcess from 'child_process';
import dotenv from 'dotenv';
import waitPort from 'wait-port';
import got from 'got';

if (!process.env.CI) {
  dotenv.config({
    path: '../.env.test',
  });
}

const requiredEnv = ['DATABASE_URL', 'APP_URL', 'API_URL', 'STATIC_URL'];

for (let key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`missing required env var ${key}`);
  }
}

// TODO: parse this from API_URL and APP_URL
const API_PORT = 3001;
const APP_PORT = 8080;

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

async function startApiServer() {
  console.log('Starting API server');

  const apiServer = childProcess.spawn('npm', ['run', 'dev-no-watch'], {
    cwd: path.join(__dirname, '../../api'),
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: API_PORT,
    },
  });

  process.on('exit', () => {
    apiServer.kill();
  });

  const started = await waitPort({
    port: API_PORT,
    timeout: 10 * 1000,
  });

  if (!started) {
    throw new Error('api server timed out :(');
  }
}

async function startAppServer() {
  try {
    // If this doesn't throw an error, the server's already running!
    await got(process.env.APP_URL!);
    return;
  } catch {
    // continue
  }

  const appServer = childProcess.spawn('npm', ['start'], {
    cwd: path.join(__dirname, '../../app'),
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: APP_PORT,
    },
  });

  process.on('exit', () => {
    appServer.kill();
  });

  const appStarted = await waitPort({
    port: APP_PORT,
    timeout: 10 * 1000,
  });

  if (!appStarted) {
    throw new Error('app server timed out :(');
  }

  console.log('Waiting for app server...');
  await got(process.env.APP_URL!);
}

before(async function() {
  this.timeout(30 * 1000);

  await Promise.all([startApiServer(), startAppServer()]);
});

beforeEach(async () => {
  await resetDb();
});