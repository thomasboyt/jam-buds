const merge = require('webpack-merge')
const nodeExternals = require('webpack-node-externals')
const VueSSRServerPlugin = require('vue-server-renderer/server-plugin')

const baseConfig = require('./base.js')

const conf = merge(baseConfig, {
  target: 'node',

  entry: {
    app: ['babel-polyfill', './src/entry-server.js'],
  },

  output: {
    libraryTarget: 'commonjs2',
  },

  externals: [
    nodeExternals({
      whitelist: /\.css$/
    })
  ],

  plugins: [
    new VueSSRServerPlugin()
  ]
});

module.exports = conf;