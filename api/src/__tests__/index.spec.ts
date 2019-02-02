/// <reference types="mocha" />

import * as dotenv from 'dotenv';

// (this is only used for local testing, and doesn't exist in CI)
dotenv.config({
  silent: true,
  path: '../.env.test',
});

import { db, configureDatabase } from '../db';

before(async () => {
  configureDatabase();
  await db!.migrate.rollback();
  await db!.migrate.latest();
});

beforeEach(async () => {
  await (db!.raw('BEGIN') as any);
});

afterEach(async () => {
  await (db!.raw('ROLLBACK') as any);
});
