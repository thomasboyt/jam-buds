import { getEnv, getRequiredEnv, createConfig } from './utils/configUtils';

const configDef = {
  NODE_ENV: getEnv('NODE_ENV') || 'development',
  DATABASE_URL: getRequiredEnv('DATABASE_URL'),
  SENTRY_DSN_NEO: getEnv('SENTRY_DSN_NEO'),
};

const config = createConfig(configDef);

export default config;
