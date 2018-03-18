const webpack = require('webpack')
const merge = require('webpack-merge')
const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')
const dotenv = require('dotenv');

const baseConfig = require('./base.js')

module.exports = merge(baseConfig, {
  entry: {
    app: ['babel-polyfill', './src/vue-client/entry-client.js'],
  },

  output: {
    // TODO: Toggle this based on production/not prod
    publicPath: '/assets/',
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
        }
      }
    }
  },

  plugins: [
    new VueSSRClientPlugin(),
  ]
});