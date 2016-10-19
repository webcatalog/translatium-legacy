const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, `platforms/${process.env.PLATFORM}/www/js`);
const APP_DIR = path.resolve(__dirname, 'app');

/* eslint-disable no-console */

const common = {
  entry: `${APP_DIR}/index.js`,
  output: {
    path: BUILD_DIR,
    filename: 'bundle.js',
    chunkFilename: '[id].js',
  },
  module: {
    loaders: [
      {
        test: /\.js?$/,
        exclude: /(node_modules|bower_components)/,
        include: APP_DIR,
        loader: 'babel',
        query: {
          presets: ['es2015', 'react'],
        },
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.PLATFORM': JSON.stringify(process.env.PLATFORM),
    }),
  ],
};

const config = (() => {
  switch (process.env.npm_lifecycle_event) {
    case 'build-mac':
    case 'build-windows':
      return merge(common, {
        plugins: [
          new CleanWebpackPlugin([BUILD_DIR]),
          new webpack.optimize.OccurenceOrderPlugin(),
          new webpack.optimize.DedupePlugin(),
          new webpack.optimize.UglifyJsPlugin({
            compress: {
              warnings: false,
            },
            output: {
              comments: false,
            },
          }),
          new webpack.optimize.AggressiveMergingPlugin(),
        ],
      });
    case 'dev-mac':
    case 'dev-windows':
      return merge(common, {
        plugins: [
          new webpack.HotModuleReplacementPlugin({
            multiStep: true,
          }),
        ],
      });
    default:
      console.log('Unknown npm_lifecycle_event');
      return null;
  }
})();

module.exports = config;
