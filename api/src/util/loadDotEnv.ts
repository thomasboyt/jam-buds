if (process.env.NODE_ENV !== 'production' && !process.env.CI) {
  console.log('*** Loading .env file!');

  // listed as a dev dependency, so we defer loading it
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const dotenv = require('dotenv');

  if (process.env.NODE_ENV === 'test') {
    console.log('*** Loading .env.test file!');
    dotenv.config({
      path: '../.env.test',
    });
  }

  dotenv.config({
    path: '../.env',
  });
}
