if (process.env.NODE_ENV !== 'production' && !process.env.CI) {
  console.log('*** Loading .env file!');

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

import createApp from './createApp';

import {configureDatabase} from './db';

configureDatabase();

const app = createApp();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`*** Listening on port ${port}`);
});
