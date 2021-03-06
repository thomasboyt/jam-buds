if (process.env.NODE_ENV !== 'production') {
  console.log('*** Loading .env files!');

  // listed as a dev dependency, so we defer loading it
  const dotenv = require('dotenv');

  if (process.env.NODE_ENV === 'test') {
    if (!process.env.CI) {
      dotenv.config({
        path: './.env.test',
      });
    }
    dotenv.config({
      path: './.env.test.defaults',
    });
  }

  if (!process.env.CI) {
    dotenv.config({
      path: './.env.development',
    });
  }
  dotenv.config({
    path: './.env.development.defaults',
  });
}
