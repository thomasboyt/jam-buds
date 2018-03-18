const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const dotenv = require('dotenv');

// XXX:
// In development, the SSR/renderer server relies on this block to load some env vars it uses.
// This maybe should be more explicit somehow
if (!process.env.SKIP_DOTENV) {
  if (!process.env.CI) {
    if (process.env.NODE_ENV === 'test') {
      dotenv.config({
        path: '../.env.test',
      });
    } else if (process.env.NODE_ENV === 'production') {
      dotenv.config({
        path: '../.env.production',
      });
    } else {
      dotenv.config({
        path: '../.env',
      });
    }
  }
}

const mode = process.env.NODE_ENV || 'development';

// TODO: this is broken on heroku cuz it's not a real git repo :(
// function gitSha() {
//   const execSync = require('child_process').execSync;
//   return execSync('git rev-parse --short HEAD', {encoding: 'utf8'}).trim();
// }

let envVars = {
  API_URL: `"${process.env.API_URL}"`,
  NODE_ENV: `"${process.env.NODE_ENV}"`
};

if (mode === 'production') {
  envVars = {
    ...envVars,
    SENTRY_PUBLIC_DSN: `"${process.env.SENTRY_PUBLIC_DSN}"`,
  };
}

module.exports = {
  mode,

  output: {
    path: path.resolve(__dirname, '../build'),
    filename: '[name].[chunkhash].js',
    publicPath: process.env.STATIC_URL + '/',
  },

  resolve: {
    extensions: ['.jsx', '.js'],
  },

  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },

      {
        test: /\.js$/,
        loader: 'babel-loader',
      },

      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract([
          'css-loader',
          'sass-loader'
        ]),
      },

      {
        test: /\.jpg$|\.png$/,
        loader: 'file-loader',
      },

      {
        test: /\.svg$/,
        loader: 'raw-loader',
      }
    ]
  },

  plugins: [
    new ExtractTextPlugin('[name].[chunkhash].css'),

    new webpack.DefinePlugin({
      'process.env': envVars,
    }),
  ],
};
