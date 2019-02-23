import knex from 'knex';
import knexStringcase from 'knex-stringcase';

export let db: knex | undefined;

export function configureDatabase() {
  const config: knex.Config = {
    client: 'pg',
    connection: process.env.DATABASE_URL,
  };

  if (process.env.NODE_ENV === 'test') {
    // A single connection is used in testing so that all operations can be wrapped in a transaction
    config.pool = {
      min: 1,
      max: 1,
    };
  }

  db = knex(knexStringcase(config));
}
