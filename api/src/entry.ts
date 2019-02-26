import './utils/loadDotEnv';

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
