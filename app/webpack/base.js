const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
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

const baseEnvVars = {
  NODE_ENV: process.env.NODE_ENV,
  SENTRY_PUBLIC_DSN_APP: process.env.SENTRY_PUBLIC_DSN_APP,
  DISABLE_APPLE_MUSIC: process.env.DISABLE_APPLE_MUSIC,
  STATIC_URL: process.env.STATIC_URL,
  DANGER_SKIP_AUTH: process.env.DANGER_SKIP_AUTH,
};

const baseConfig = {
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
        use: [
          process.env.NODE_ENV !== 'production'
            ? 'vue-style-loader'
            : MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.css$/,
        use: [
          process.env.NODE_ENV !== 'production'
            ? 'vue-style-loader'
            : MiniCssExtractPlugin.loader,
          'css-loader',
        ],
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
    new MiniCssExtractPlugin({
      filename: '[name].[chunkhash].css',
      chunkFilename: '[name].[chunkhash].css',
    }),
    new VueLoaderPlugin(),
  ],
};

module.exports = (envConfig, environmentEnvVars) => {
  const envVars = {
    ...baseEnvVars,
    ...environmentEnvVars,
  };

  for (let key of Object.keys(envVars)) {
    // DefinePlugin interpolates strings without surrounding quotation marks;
    // this is an easy way to re-add them where needed
    envVars[key] = JSON.stringify(envVars[key]);
  }

  return merge(baseConfig, envConfig, {
    plugins: [
      new webpack.DefinePlugin({
        'process.env': envVars,
      }),
    ],
  });
};
