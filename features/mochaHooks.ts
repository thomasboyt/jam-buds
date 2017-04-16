/// <reference types="mocha" />

import * as path from 'path';
import * as childProcess from 'child_process';

import * as dotenv from 'dotenv';

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

before(async () => {
  // this uses a node entry point instead of ts-node cuz i couldn't easily clean up after ts-node
  // exited
  const child = childProcess.spawn('node', ['src/server/entry.js'], {
    stdio: 'inherit',
  });

  process.on('exit', () => {
    child.kill();
  });
});

beforeEach(async () => {
  await resetDb();
});