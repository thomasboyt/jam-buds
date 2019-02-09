const webpack = require('webpack');
const path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const dotenv = require('dotenv');

if (process.env.NODE_ENV !== 'production') {
  if (!process.env.CI) {
    if (process.env.NODE_ENV === 'test') {
      dotenv.config({
        path: '../.env.test',
      });
    } else {
      dotenv.config({
        path: '../.env',
      });
    }
  }
}

// TODO: this is broken on heroku cuz it's not a real git repo :(
// function gitSha() {
//   const execSync = require('child_process').execSync;
//   return execSync('git rev-parse --short HEAD', {encoding: 'utf8'}).trim();
// }

let envVars = {
  NODE_ENV: `"${process.env.NODE_ENV}"`,
};

if (process.env.NODE_ENV === 'production') {
  envVars = {
    ...envVars,
    SENTRY_PUBLIC_DSN_APP: `"${process.env.SENTRY_PUBLIC_DSN_APP}"`,
  };
}

module.exports = {
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',

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
        use: ExtractTextPlugin.extract(['css-loader', 'sass-loader']),
      },

      {
        test: /\.jpg$|\.png$/,
        loader: 'file-loader',
      },

      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        options: {
          esModule: false,
        },
      },
    ],
  },

  plugins: [
    new ExtractTextPlugin('[name].[chunkhash].css'),
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      'process.env': envVars,
    }),
  ],
};
