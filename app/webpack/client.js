const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

const mergeBase = require('./base.js');

let musicKitAuthToken = '';
if (!process.env.DISABLE_APPLE_MUSIC) {
  const genMusicKitToken = require('@tboyt/music-kit-jwt');
  musicKitAuthToken = genMusicKitToken.default({
    pathToPrivateKey: process.env.MUSICKIT_PRIVATE_KEY_PATH,
    teamId: process.env.MUSICKIT_TEAM_ID,
    keyId: process.env.MUSICKIT_KEY_ID,
  });
}

const envVars = {
  VUE_ENV: 'client',
  MUSICKIT_AUTH_TOKEN: musicKitAuthToken,
};

const config = {
  entry: {
    app: [
      '@babel/polyfill',
      'normalize.css/normalize.css',
      './src/entry-client.js',
    ],
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: (module) => {
            if (!module.nameForCondition) {
              return false;
            }

            const name = module.nameForCondition();
            return /node_modules/.test(name) && !/\.css$/.test(name);
          },
          chunks: 'initial',
          name: 'vendor',
          priority: 10,
          enforce: true,
        },
      },
    },
  },

  plugins: [new VueSSRClientPlugin()],
};

module.exports = mergeBase(config, envVars);
