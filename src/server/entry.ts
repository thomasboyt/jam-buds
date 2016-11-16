import * as express from 'express';
import * as bodyParser from 'body-parser';

import {configureDatabase} from './db';
import registerTwitterEndpoints from './twitter';
import {getUserByAuthToken} from './models/user';

if (process.env.NODE_ENV !== 'production') {
 require('dotenv').config();
}

configureDatabase();

const app = express();
app.use(bodyParser.json());

app.get('/', async (req, res) => {
  let user;

  if (req.params.authToken) {
    user = await getUserByAuthToken(req.params.authToken);
  }

  if (!user) {
    res.send('hello unregistered user');
  } else {
    res.send(`hello ${user.twitterName}`);
  }
});

registerTwitterEndpoints(app);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});


process.on('unhandledRejection', (err: Error) => {
  console.error(err.stack);
  process.exit(1);
});
