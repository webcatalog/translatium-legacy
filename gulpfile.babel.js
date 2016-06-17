import gulp from 'gulp';
import stylus from 'gulp-stylus';
import rename from 'gulp-rename';
import bom from 'gulp-bom';
import webpackStream from 'webpack-stream';
import webpack from 'webpack';
import path from 'path';

const targetDir = 'platform/www/';

gulp.task('html', () =>
  gulp.src('src/index.html')
    .pipe(bom())
    .pipe(gulp.dest(targetDir))
);

gulp.task('stylus', () =>
  gulp.src(['src/styles/app-dark.styl', 'src/styles/app-light.styl'])
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
  gulp.src('src/app.js')
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
              presets: ['stage-0', 'react'],
            },
            exclude: /(node_modules|bower_components)/,
          },
        ],
      },
      resolve: {
        root: path.resolve('src'),
      },
      plugins: [
        new webpack.optimize.UglifyJsPlugin({
          sourceMap: false,
          mangle: false,
        }),
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
gulp.task('default', ['html', 'stylus', 'webpack']);
