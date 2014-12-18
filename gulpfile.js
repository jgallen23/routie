/* jshint globalstrict: true */
/* global require: false*/

'use strict';

var gulp = require('gulp'),
lint = require('gulp-jshint'),
test = require('gulp-testem'),
http = require('http'),
fs = require('fs');

gulp.task('lint', function () {
  return gulp.src(['src/**/*.js', 'test/**/*.js'])
  .pipe(lint())
  .pipe(lint.reporter('default', { verbose: true }));
});

gulp.task('coverage', function () {
  var coverage, port;

  coverage = http.createServer(function (req, resp) {
    req.pipe(fs.createWriteStream('coverage.json'));
    resp.end();
  });

  port = 7358;

  coverage.listen(port);
  console.log('Coverage server started on port: ' + port);
});

gulp.task('test', ['coverage'], function () {
  gulp.src([''])
  .pipe(test({
    configFile: '.testem.json'
  }));
});
