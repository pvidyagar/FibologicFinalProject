'use strict';

var gulp = require('gulp');
var os = require('os');
var browserSync = require('browser-sync');
var nodemon = require('gulp-nodemon');

// we'd need a slight delay to reload browsers
// connected to browser-sync after restarting nodemon
var BROWSER_SYNC_RELOAD_DELAY = 1200;

gulp.task('nodemon', function (cb) {
  var called = false;
  return nodemon({

    // nodemon our expressjs server
    script: 'server.js',

    // watch core server file(s) that require server restart on change
    watch: ['server.js']
  })
    .on('start', function onStart() {
      // ensure start only got called once
      if (!called) { cb(); }
      called = true;
    })
    .on('restart', function onRestart() {
      // reload connected browsers after a slight delay
      setTimeout(function reload() {
        browserSync.reload({
          stream: false
        });
      }, BROWSER_SYNC_RELOAD_DELAY);
    });
});

gulp.task('browser-sync', ['nodemon'], function () {

	var myBrowser = os.platform() === 'linux' ? 'google-chrome' : (
			  os.platform() === 'darwin' ? 'google chrome' : (
			  os.platform() === 'win32' ? 'chrome' : 'firefox'));
  
	// for more browser-sync config options: http://www.browsersync.io/docs/options/
  browserSync({

    // informs browser-sync to proxy our expressjs app which would run at the following location
    proxy: 'http://localhost:3000',

    // informs browser-sync to use the following port for the proxied app
    // notice that the default port is 3000, which would clash with our expressjs
    port: 4000,

    // open the proxied app in chrome
    browser: [myBrowser]
  });
});

gulp.task('js',  function () {
   return gulp.src('client/views/js/*.js');
});

gulp.task('css', function () {
   gulp.src('client/views/css/*.css')
   .pipe(browserSync.reload({ stream: true }));
});


/*gulp.task('html', function () {
   gulp.src('client/views/*.html');
});*/

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('default', ['browser-sync'], function () {
  gulp.watch('client/**/*.js',   ['js', browserSync.reload]);
  gulp.watch('client/**/*.css',  ['css']);
  gulp.watch('client/**/*.html', ['bs-reload']);
});
