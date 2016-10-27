const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, `platforms/${process.env.PLATFORM}/www`);
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
        test: /\.json$/,
        loader: 'json',
      },
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
      'process.env.VERSION': JSON.stringify(process.env.npm_package_version),
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
          new CopyWebpackPlugin([
            { from: 'platforms/common/www' },
          ]),
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
          new CopyWebpackPlugin([
            { from: 'platforms/common/www' },
            { from: 'node_modules/tesseract.js/dist/*.js', to: `${BUILD_DIR}/tesseract.js`, flatten: true },
          ]),
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
