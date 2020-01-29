module.exports = {
  development: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
  },

  test: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
  },

  production: {
    client: 'postgresql',
    connection: process.env.DATABASE_URL,
  },
};
