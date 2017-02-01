const webpack = require('webpack');
const path = require('path');
const merge = require('webpack-merge');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const BomPlugin = require('webpack-utf8-bom');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const BUILD_DIR = path.resolve(__dirname, `platforms/${process.env.PLATFORM}/www`);
const APP_DIR = path.resolve(__dirname, 'src');

/* eslint-disable no-console */

const common = {
  entry: {
    main: `${APP_DIR}/index.js`,
    vendor: ['react', 'react-dom', 'react-redux'],
  },
  output: {
    path: BUILD_DIR,
    filename: '[name].bundle.js',
    chunkFilename: '[id].chunk.js',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.hbs$/,
        loader: 'handlebars-loader',
      },
      {
        test: /\.js?$/,
        loader: 'babel-loader',
      },
    ],
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: 'vendor.bundle.js',
      minChunks: 2,
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'process.env.PLATFORM': JSON.stringify(process.env.PLATFORM),
      'process.env.VERSION': JSON.stringify(process.env.npm_package_version),
    }),
    new HtmlWebpackPlugin({
      inject: false,
      minify: {
        removeComments: true,
      },
      isWindows: process.env.PLATFORM === 'windows',
      isMac: process.env.PLATFORM === 'mac',
      template: 'src/index.hbs',
    }),
  ],
};

const config = (() => {
  const copyArr = [
    { from: 'platforms/common/www' },
  ];

  switch (process.env.NODE_ENV) {
    case 'production':
      return merge(common, {
        plugins: [
          new CleanWebpackPlugin([BUILD_DIR]),
          new CopyWebpackPlugin(copyArr),
          new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
          }),
          new webpack.optimize.AggressiveMergingPlugin(),
          new BomPlugin(true),
        ],
      });
    case 'development':
      return merge(common, {
        plugins: [
          new CopyWebpackPlugin(copyArr),
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
