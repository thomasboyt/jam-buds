import * as path from 'path';
import * as childProcess from 'child_process';
import {configureDatabase, db} from '../../api/src/db';
import * as dotenv from 'dotenv';

if (!process.env.CI) {
  dotenv.config({
    path: '../.env.test',
  })
}

async function resetDb() {
  configureDatabase();

  try {
    console.log('rolling back');
    await db!.migrate.rollback({
      directory: '../api/migrations'
    });
    console.log('running migrations');
    await db!.migrate.latest({
      directory: '../api/migrations'
    });
    console.log('running seeds')
    await db!.seed.run({
      directory: '../api/seeds'
    });
  } catch(err) {
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

  console.log('spawning node')

  // this uses a node entry point instead of ts-node cuz i couldn't easily clean up after ts-node
  // exited
  const child = childProcess.spawn('npm', ['start'], {
    cwd: path.join(__dirname, '../../api'),
    stdio: 'inherit',
  });

  process.on('exit', () => {
    child.kill();
  });

  console.log('Waiting 5 seconds for server start...')
  await waitForStart(5 * 1000);
});

beforeEach(async () => {
  await resetDb();
});