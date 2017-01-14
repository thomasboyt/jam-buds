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

beforeEach(async () => {
  await resetDb();
});