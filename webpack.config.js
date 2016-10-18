const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');

const BUILD_DIR = path.resolve(__dirname, 'platform/www');
const APP_DIR = path.resolve(__dirname, 'app');

const common = {
  entry: `${APP_DIR}/index.js`,
  output: {
    path: BUILD_DIR,
    filename: 'bundle.min.js',
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
};

const config = (() =>
  merge(common, {
    plugins: [
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
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
        },
      }),
    ],
  })
)();

module.exports = config;
