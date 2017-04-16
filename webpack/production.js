var webpack = require('webpack');
var webpackMerge = require('webpack-merge');

var config = require('./base');

var execSync = require('child_process').execSync;
var sha = execSync('git rev-parse --short HEAD', {encoding: 'utf8'}).trim();

module.exports = webpackMerge(config, {
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"',
        BUILD_SHA: `"${sha}"`,
        SENTRY_PUBLIC_DSN: `"${process.env.SENTRY_PUBLIC_DSN}"`,
      }
    }),

    new webpack.optimize.UglifyJsPlugin()
  ],
});
