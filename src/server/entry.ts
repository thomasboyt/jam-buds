import createApp from './createApp';

import {configureDatabase} from './db';

if (process.env.NODE_ENV !== 'production') {
  console.log('*** Loading .env file!');
  require('dotenv').config();
}

configureDatabase();

const app = createApp();

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`*** Listening on port ${port}`);
});

process.on('unhandledRejection', (err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
