var createVendorChunk = require('webpack-create-vendor-chunk');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    app: './src/client/entry.tsx',
  },

  output: {
    path: './build',
    filename: '[name].[chunkhash].js',
    publicPath: '/',
  },

  plugins: [
    createVendorChunk(),
    new ExtractTextPlugin('[name].[chunkhash].css'),

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
        loader: 'ts',
      },

      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract(['css', 'sass']),
      }
    ]
  },

  devServer: {
    contentBase: 'static',
    historyApiFallback: true,
  },
};
