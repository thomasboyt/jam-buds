/// <reference types="mocha" />

import * as expect from 'expect';
import * as dotenv from 'dotenv';

// (this is only used for local testing, and doesn't exist in CI)
dotenv.config({
  silent: true,
  path: './.env.test',
});

import {db, configureDatabase} from '../db';

beforeEach(async () => {
  configureDatabase();
  await db!.migrate.rollback();
  await db!.migrate.latest();
});

afterEach(async() => {
  await db!.migrate.rollback();
});