var ExtractTextPlugin = require('extract-text-webpack-plugin');
var StatsPlugin = require('stats-webpack-plugin');
var path = require('path');

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
  mode: 'development',

  entry: {
    app: './src/client/entry.tsx',
  },

  output: {
    path: path.resolve(__dirname, '../build'),
    filename: '[name].[chunkhash].js',
    publicPath: process.env.STATIC_URL + '/',
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
    new ExtractTextPlugin('[name].[chunkhash].css'),
    new StatsPlugin('manifest.json', {
      // We only need assetsByChunkName
      chunkModules: false,
      source: false,
      chunks: false,
      modules: false,
      assets: true
    }),
  ],

  resolve: {
    extensions: ['.jsx', '.js', '.tsx', '.ts'],
  },

  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
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

  devServer: {
    contentBase: 'static',
    historyApiFallback: true,
    port: process.env.DEV_SERVER_PORT || 8080,
    host: '0.0.0.0',
  },
};
