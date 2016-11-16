var path = require('path');
var createVendorChunk = require('webpack-create-vendor-chunk');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: [
      './client/entry.ts',
    ],
  },

  output: {
    path: './build',
    filename: '[name].[chunkhash].js'
  },

  plugins: [
    createVendorChunk(),

    new HtmlWebpackPlugin({
      template: './templates/index.html',
      filename: 'index.html',
      inject: 'body',
      chunks: ['vendor', 'app'],
    }),
  ],

  resolve: {
    extensions: ['', '.jsx', '.js', '.tsx', '.ts'],

    alias: {
      '__root': process.cwd(),
    },
  },

  devtool: 'source-map',

  ts: {
    compilerOptions: {
      noEmit: false,
    },
  },

  module: {
    loaders: [
      {
        test: /\.tsx?$/,
        loaders: ['ts']
      }
    ]
  },

  devServer: {
    contentBase: 'static',
  },
};