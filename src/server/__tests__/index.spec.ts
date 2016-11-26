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
  await db!.seed.run();
});

afterEach(async() => {
  await db!.migrate.rollback();
});

describe('test db configuration', () => {
  it('works', async () => {
    const rows = await (db!('users').where({id: 1}) as any);
    expect(rows[0].twitter_name).toBe('jeff');
  });
});