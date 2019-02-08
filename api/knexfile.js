if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({
    path: '../.env',
  });
  // } else {
  //   // XXX: This fixes knex not using SSL for Heroku connections
  //   const pg = require('pg');
  //   pg.defaults.ssl = true;
}

module.exports = {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
  },
};
