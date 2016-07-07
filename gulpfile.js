const gulp = require('gulp');
const stylus = require('gulp-stylus');
const rename = require('gulp-rename');
const bom = require('gulp-bom');
const bro = require('gulp-bro');
const babelify = require('babelify');
const uglify = require('gulp-uglify');
const envify = require('envify/custom');

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


gulp.task('bro', () =>
  gulp.src('app/index.js')
    .pipe(bro({
      transform: [
        babelify.configure({ presets: ['es2015', 'react'] }),
        envify({
          NODE_ENV: 'production',
        }),
      ],
    }))
    .pipe(rename({
      basename: 'bundle',
      suffix: '.min',
    }))
    .pipe(uglify())
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
gulp.task('build', ['html', 'stylus', 'bro']);
gulp.task('default', ['prepare', 'build']);
