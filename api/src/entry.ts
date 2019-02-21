if (process.env.NODE_ENV !== 'production' && !process.env.CI) {
  console.log('*** Loading .env file!');

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

import createApp from './createApp';

import { configureDatabase } from './db';
import { configureRedis } from './redis';

configureDatabase();
configureRedis();

const app = createApp();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`*** Listening on port ${port}`);
});
