import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

import {configureDatabase} from './db';

import registerTwitterEndpoints from './routes/twitter';
import registerUserEndpoints from './routes/users';
import registerSearchEndpoints from './routes/search';

if (process.env.NODE_ENV !== 'production') {
  console.log('*** Loading .env file!');
  require('dotenv').config();
}

configureDatabase();

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: process.env.STATIC_URL,
}))

registerUserEndpoints(app);
registerTwitterEndpoints(app);
registerSearchEndpoints(app);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`*** Listening on port ${port}`);
});

process.on('unhandledRejection', (err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
