var gulp = require('gulp');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var minifyCss = require('gulp-minify-css');
var minifyHTML = require('gulp-minify-html');
var bom = require('gulp-bom');

gulp.task('compress-modules-js', function () {
    return gulp.src('src/modules/*.js')
      .pipe(concat('concat.js'))
      .pipe(uglify())
      .pipe(rename('bundle.min.js'))
      .pipe(bom())
      .pipe(gulp.dest('./'));
});

gulp.task('compress-pages-js', function () {
    return gulp.src('src/pages/**/*.js')
      .pipe(uglify())
      .pipe(bom())
      .pipe(gulp.dest('./pages/'));
});

gulp.task('compress-css', function () {
    return gulp.src('src/**/*.css')
      .pipe(minifyCss())
      .pipe(bom())
      .pipe(gulp.dest('./'));
});

gulp.task('compress-html', function () {
    return gulp.src('src/**/*.html')
      .pipe(minifyHTML())
      .pipe(bom())
      .pipe(gulp.dest('./'));
});

gulp.task('default', ['compress-modules-js', 'compress-pages-js', 'compress-css', 'compress-html']);
