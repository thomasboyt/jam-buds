var path = require('path');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  mode: 'development',

  entry: {
    app: './src/vue-client/entry.ts',
  },

  output: {
    path: path.resolve(__dirname, '../build'),
    filename: '[name].[chunkhash].js',
    publicPath: process.env.STATIC_URL + '/',
  },

  resolve: {
    extensions: ['.jsx', '.js', '.tsx', '.ts'],
  },

  devtool: 'source-map',

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        rules: [{
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              module: 'es2015',
            }
          }
        }],
      },

      {
        test: /\.vue$/,
        rules: [{
          loader: 'vue-loader',
        }]
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

  plugins: [
    new ExtractTextPlugin('[name].[chunkhash].css'),
  ],
};
