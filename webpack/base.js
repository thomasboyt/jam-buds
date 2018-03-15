var path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  mode: 'development',

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
  ],
};
