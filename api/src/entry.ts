import createApp from './createApp';

import {configureDatabase} from './db';

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

configureDatabase();

const app = createApp(process.env.NODE_ENV);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`*** Listening on port ${port}`);
});

process.on('unhandledRejection', (err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
