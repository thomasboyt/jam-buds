import * as path from 'path';
import * as childProcess from 'child_process';

function resetDb() {
  // THIS IS SO WACKY
  // See https://github.com/tgriesser/knex/issues/1851#issuecomment-272371575
  const resetPath = path.join(__dirname, './resetTestDb.js');

  return new Promise((resolve, reject) => {
    const resetProcess = childProcess.exec(`node ${resetPath}`, (err) => {
      if (err) {
        reject();
      } else {
        resolve();
      }
    });

    resetProcess.stdout.pipe(process.stdout);
    resetProcess.stderr.pipe(process.stderr);
  });
}

function waitForStart(ms: number): Promise<any> {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve(), ms);
  });
}

before(async function() {
  this.timeout(0);

  console.log('spawning node')

  // this uses a node entry point instead of ts-node cuz i couldn't easily clean up after ts-node
  // exited
  const child = childProcess.spawn('node', ['npm start'], {
    cwd: path.join(__dirname, '../api'),
    stdio: 'inherit',
  });

  process.on('exit', () => {
    child.kill();
  });

  console.log('Waiting 10 seconds for server start...')
  await waitForStart(10 * 1000);
});

beforeEach(async () => {
  await resetDb();
});