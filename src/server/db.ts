import * as knex from 'knex';

export let db: knex | undefined;

export function configureDatabase() {
  db = knex({
    client: 'pg',
    connection: process.env.DATABASE_URL
  });
}