import {
  getEnv,
  getRequiredEnv,
  getBooleanEnv,
  createConfig,
} from './util/configUtils';

const configDef = {
  DATABASE_URL: getRequiredEnv('DATABASE_URL'),
  REDIS_URL: getRequiredEnv('REDIS_URL'),

  JB_APP_URL: getRequiredEnv('JB_APP_URL'),
  JB_API_PORT: getRequiredEnv('JB_API_PORT'),

  NODE_ENV: getEnv('NODE_ENV') || 'development',
  TEST_ENV: getEnv('TEST_ENV'),
  CI: getBooleanEnv('CI'),

  SPOTIFY_CLIENT_ID: getEnv('SPOTIFY_CLIENT_ID'),
  SPOTIFY_CLIENT_SECRET: getEnv('SPOTIFY_CLIENT_SECRET'),

  TWITTER_API_KEY: getEnv('TWITTER_API_KEY'),
  TWITTER_API_SECRET: getEnv('TWITTER_API_SECRET'),

  DISABLE_APPLE_MUSIC: getBooleanEnv('DISABLE_APPLE_MUSIC'),
  MUSICKIT_PRIVATE_KEY_PATH: getEnv('MUSICKIT_PRIVATE_KEY_PATH'),
  MUSICKIT_KEY_ID: getEnv('MUSICKIT_KEY_ID'),
  MUSICKIT_TEAM_ID: getEnv('MUSICKIT_TEAM_ID'),

  DISABLE_BUTTONDOWN: getBooleanEnv('DISABLE_BUTTONDOWN'),
  BUTTONDOWN_API_KEY: getEnv('BUTTONDOWN_API_KEY'),

  SENDGRID_API_KEY: getEnv('SENDGRID_API_KEY'),

  DANGER_SKIP_AUTH: getBooleanEnv('DANGER_SKIP_AUTH'),

  SENTRY_DSN_API: getEnv('SENTRY_DSN_API'),
  ENABLE_STACKDRIVER_TRACE: getEnv('ENABLE_STACKDRIVER_TRACE'),

  JB_RHIANNON_URL: getEnv('JB_RHIANNON_URL'),
  ENABLE_RHIANNON: getBooleanEnv('ENABLE_RHIANNON'),
};

const config = createConfig(configDef);

// production checks
const requiredProductionKeys: Array<keyof typeof configDef> = [
  'SPOTIFY_CLIENT_ID',
  'SPOTIFY_CLIENT_SECRET',
  'TWITTER_API_KEY',
  'TWITTER_API_SECRET',
  'MUSICKIT_PRIVATE_KEY_PATH',
  'MUSICKIT_KEY_ID',
  'MUSICKIT_TEAM_ID',
  'BUTTONDOWN_API_KEY',
  'SENDGRID_API_KEY',
  'SENTRY_DSN_API',
  'JB_RHIANNON_URL',
];

if (config.get('NODE_ENV') === 'production') {
  if (config.get('DANGER_SKIP_AUTH')) {
    throw new Error(
      'refusing to start in production with DANGER_SKIP_AUTH enabled'
    );
  }

  for (const key of requiredProductionKeys) {
    config.require(key);
  }
}

export default config;
