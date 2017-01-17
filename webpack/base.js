var createVendorChunk = require('webpack-create-vendor-chunk');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');

const dotenv = require('dotenv');

if (!process.env.CI) {
  if (process.env.NODE_ENV === 'test') {
    dotenv.config({
      path: '.env.test',
    });
  } else if (process.env.NODE_ENV === 'production') {
    dotenv.config({
      path: '.env.production',
    });
  } else {
    dotenv.config();
  }
}

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
      },

      {
        test: /\.jpg$|\.png$/,
        loader: 'file',
      },

      {
        test: /\.svg$/,
        loader: 'svg-sprite?' + JSON.stringify({
          name: '[name]_[hash]',
        })
      }
    ]
  },

  devServer: {
    contentBase: 'static',
    historyApiFallback: true,
    port: process.env.DEV_SERVER_PORT || 8080,
    host: '0.0.0.0',
  },
};
