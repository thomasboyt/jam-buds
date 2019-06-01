const nodeExternals = require('webpack-node-externals');
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');

const mergeBase = require('./base.js');

const envVars = {
  VUE_ENV: 'server',
};

const config = {
  target: 'node',

  entry: {
    app: [
      '@babel/polyfill',
      'normalize.css/normalize.css',
      './src/entry-server.js',
    ],
  },

  output: {
    libraryTarget: 'commonjs2',
  },

  externals: [
    nodeExternals({
      whitelist: [/\.css$/, /\?vue&type=style/],
    }),
  ],

  plugins: [new VueSSRServerPlugin()],
};

module.exports = mergeBase(config, envVars);
