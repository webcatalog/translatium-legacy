/* eslint-disable import/no-extraneous-dependencies */

const gulp = require('gulp');
const stylus = require('gulp-stylus');
const rename = require('gulp-rename');
const bom = require('gulp-bom');
const babelify = require('babelify');
const browserify = require('browserify');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const uglify = require('gulp-uglify');
const envify = require('envify/custom');

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


gulp.task('bro', () => {
  const b = browserify({
    entries: 'app/index.js',
    debug: false,
    transform: [
      babelify.configure({ presets: ['es2015', 'react'] }),
      envify({
        NODE_ENV: 'production',
        APP_PROFILE: 'main',
      }),
    ],
  });

  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(rename({
      basename: 'bundle',
      suffix: '.min',
    }))
    .pipe(uglify())
    .pipe(bom())
    .pipe(gulp.dest(`${targetDir}/www/`));
});

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
gulp.task('build', ['html', 'stylus', 'bro']);
gulp.task('default', ['prepare', 'build']);
