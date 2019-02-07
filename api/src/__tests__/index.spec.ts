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

  // reset schema and run all migrations
  await db!.raw('DROP SCHEMA public CASCADE;');
  await db!.raw('CREATE SCHEMA public;');
  await db!.migrate.latest();
});

beforeEach(async () => {
  await db!.raw('BEGIN');
});

afterEach(async () => {
  await db!.raw('ROLLBACK');
});
