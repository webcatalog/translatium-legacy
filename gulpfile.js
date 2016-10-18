/* eslint-disable import/no-extraneous-dependencies */

const gulp = require('gulp');
const stylus = require('gulp-stylus');
const rename = require('gulp-rename');
const bom = require('gulp-bom');
const source = require('vinyl-source-stream');

const webpack = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');

const targetDir = 'platform';

gulp.task('html', () =>
  gulp.src(['app/index.html', 'app/index.lite.html'])
    .pipe(bom())
    .pipe(gulp.dest(`${targetDir}/www/`))
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
    .pipe(gulp.dest(`${targetDir}/www/`))
);


gulp.task('webpack', () =>
  gulp.src('app/index.js')
    .pipe(source('app.js'))
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(`${targetDir}/www/`))
);

gulp.task('strings', () =>
  gulp.src('app/strings/**/**')
    .pipe(bom())
    .pipe(gulp.dest(`${targetDir}/strings/`))
);

gulp.task('images', () =>
  gulp.src('app/images/**/**')
    .pipe(gulp.dest(`${targetDir}/images/`))
);

gulp.task('winjs', () =>
  gulp.src('node_modules/winjs/**/**')
    .pipe(bom())
    .pipe(gulp.dest(`${targetDir}/www/winjs/`))
);

gulp.task('winjs-localization', () =>
  gulp.src('node_modules/winjs-localization/**/**')
    .pipe(bom())
    .pipe(gulp.dest(`${targetDir}/www/winjs-localization/`))
);

gulp.task('prepare', ['strings', 'images', 'winjs', 'winjs-localization']);
gulp.task('build', ['html', 'stylus', 'webpack']);
gulp.task('default', ['prepare', 'build']);
