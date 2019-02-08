if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({
    path: '../.env',
  });
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
