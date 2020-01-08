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

function resetDb() {
  childProcess.spawnSync('npm', ['run', 'resetdb'], {
    cwd: path.join(__dirname, '../../api'),
    stdio: 'inherit',
    env: {
      ...process.env,
    },
  });
}

async function startApiServer() {
  console.log('Starting API server');

  const apiServer = childProcess.spawn('npm', ['run', 'dev-no-watch'], {
    cwd: path.join(__dirname, '../../api'),
    stdio: 'inherit',
    env: {
      ...process.env,
      DANGER_SKIP_AUTH: 'true',
    },
  });

  process.on('exit', () => {
    apiServer.kill();
  });

  const started = await waitPort({
    port: parseInt(process.env.JB_API_PORT!),
    timeout: 15 * 1000,
  });

  if (!started) {
    throw new Error('api server timed out :(');
  }
}

async function startAppServer() {
  try {
    // If this doesn't throw an error, the server's already running!
    await got(process.env.JB_APP_URL!);
    return;
  } catch {
    // continue
  }

  const appServer = childProcess.spawn('npm', ['start'], {
    cwd: path.join(__dirname, '../../app'),
    stdio: 'inherit',
    env: {
      ...process.env,
      DANGER_SKIP_AUTH: 'true',
    },
  });

  process.on('exit', () => {
    appServer.kill();
  });

  const appStarted = await waitPort({
    port: parseInt(process.env.JB_APP_PORT!),
    timeout: 10 * 1000,
  });

  if (!appStarted) {
    throw new Error('app server timed out :(');
  }

  console.log('Waiting for app server...');
  await got(process.env.JB_APP_URL!);
}

before(async function() {
  this.timeout(30 * 1000);

  await Promise.all([startApiServer(), startAppServer()]);
});

beforeEach(() => {
  resetDb();
});
