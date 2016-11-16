import * as express from 'express';
import * as bodyParser from 'body-parser';

import {configureDatabase} from './db';
import registerTwitterEndpoints from './routes/twitter';
import registerUserEndpoints from './routes/users';
import {getUserByAuthToken} from './models/user';

if (process.env.NODE_ENV !== 'production') {
 require('dotenv').config();
}

configureDatabase();

const app = express();
app.use(bodyParser.json());

registerUserEndpoints(app);
registerTwitterEndpoints(app);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});

process.on('unhandledRejection', (err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
