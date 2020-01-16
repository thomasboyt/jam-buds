import knex from 'knex';
import knexStringcase from 'knex-stringcase';
import config from './config';
import { splitByDot } from './models/utils';

export let db: knex | undefined;

export function configureDatabase() {
  const knexConfig: knex.Config = {
    client: 'pg',
    connection: config.get('DATABASE_URL'),
    asyncStackTraces: true,
  };

  if (config.get('NODE_ENV') === 'test') {
    // A single connection is used in testing so that all operations can be wrapped in a transaction
    knexConfig.pool = {
      min: 1,
      max: 1,
    };
  }

  // Split `foo.bar` -> `{foo: {bar}}`
  knexConfig.postProcessResponse = (
    value: Record<string, any> | Array<any>
  ) => {
    if (Array.isArray(value)) {
      return value.map((row) => splitByDot(row));
    }
    return splitByDot(value);
  };

  db = knex(knexStringcase(knexConfig));
}
