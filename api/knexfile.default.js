// Update with your config settings.

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
} else {
  // XXX: This fixes knex not using SSL for Heroku connections
  // Comment this out if you're not using Heroku/SSL database connections
  const pg = require('pg');
  pg.defaults.ssl = true;
}

module.exports = {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },

  production: {
    client: 'postgresql',
    connection: '',
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
    },
  },
};
