const webpack = require('webpack');
const merge = require('webpack-merge');
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin');

const baseConfig = require('./base.js');

let musicKitAuthToken = '';
if (!process.env.DISABLE_APPLE_MUSIC) {
  const genMusicKitToken = require('@tboyt/music-kit-jwt');
  musicKitAuthToken = genMusicKitToken.default({
    pathToPrivateKey: process.env.MUSICKIT_PRIVATE_KEY_PATH,
    teamId: process.env.MUSICKIT_TEAM_ID,
    keyId: process.env.MUSICKIT_KEY_ID,
  });
}

module.exports = merge(baseConfig, {
  entry: {
    app: ['@babel/polyfill', './src/entry-client.js'],
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'vendor',
          priority: 10,
          enforce: true,
        },
      },
    },
  },

  plugins: [
    new VueSSRClientPlugin(),

    new webpack.DefinePlugin({
      'process.env': {
        VUE_ENV: `"client"`,
        MUSICKIT_AUTH_TOKEN: `"${musicKitAuthToken}"`,
      },
    }),
  ],
});
