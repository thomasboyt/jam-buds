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

  // This could theoretically be magically used to convert to_json objects to
  // camelcase. I'm kind of scared of using it because camelcase-keys seems to
  // have a bunch of edge cases where it breaks (e.g. it can't handle
  // arrays-of-non-object-values).

  //   // Convert nested to_json objects to camelcase
  //   postProcessResponse: (value: any): any => {
  //     if (value && typeof value === 'object') {
  //       console.log(value);
  //       return camelcaseKeys(value, { deep: true });
  //     } else {
  //       return value;
  //     }
  //   },
  // })
  db = knex(knexStringcase(config));
}
