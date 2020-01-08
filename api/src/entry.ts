// this is fine to check before loadDotEnv since it's only gonna be used in prod
if (process.env.ENABLE_STACKDRIVER_TRACE) {
  require('@google-cloud/trace-agent').start();
}

import './util/loadDotEnv';
import createApp from './createApp';

import { configureDatabase } from './db';
import { configureRedis } from './redis';

configureDatabase();
configureRedis();

const app = createApp();

const port = process.env.JB_API_PORT || 3000;

app.listen(port, () => {
  console.log(`*** Listening on port ${port}`);
});
