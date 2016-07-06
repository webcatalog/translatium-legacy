const gulp = require('gulp');
const stylus = require('gulp-stylus');
const rename = require('gulp-rename');
const bom = require('gulp-bom');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const path = require('path');

const targetDir = 'platform/www/';

gulp.task('html', () =>
  gulp.src('app/index.html')
    .pipe(bom())
    .pipe(gulp.dest(targetDir))
);

gulp.task('stylus', () =>
  gulp.src(['app/styles/app-dark.styl', 'app/styles/app-light.styl'])
    .pipe(stylus({
      compress: true,
    }))
    .pipe(rename({
      suffix: '.min',
    }))
    .pipe(bom())
    .pipe(gulp.dest(targetDir))
);


gulp.task('webpack', () =>
  gulp.src('app/index.js')
    .pipe(webpackStream({
      cache: true,
      output: {
        filename: 'bundle.min.js',
      },
      module: {
        loaders: [
          {
            test: /\.js/,
            loader: 'babel-loader',
            query: {
              presets: ['es2015', 'react'],
            },
            exclude: /(node_modules|bower_components)/,
          },
        ],
      },
      resolve: {
        root: path.resolve('app'),
      },
      plugins: [
        /*new webpack.optimize.OccurenceOrderPlugin(),
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
        }),*/
      ],
    }))
    .pipe(bom())
    .pipe(gulp.dest(targetDir))
);

gulp.task('winjs', () =>
  gulp.src('node_modules/winjs/**/**')
    .pipe(bom())
    .pipe(gulp.dest(`${targetDir}winjs/`))
);

gulp.task('winjs-localization', () =>
  gulp.src('node_modules/winjs-localization/**/**')
    .pipe(bom())
    .pipe(gulp.dest(`${targetDir}winjs-localization/`))
);

gulp.task('prepare', ['winjs', 'winjs-localization']);
gulp.task('build', ['html', 'stylus', 'webpack']);
gulp.task('default', ['prepare', 'build']);
