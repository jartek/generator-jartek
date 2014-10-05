'use strict';

var gulp = require('gulp');
var argv = require('yargs').argv;
var spawn = require('child_process').spawn;
var path = require('path');
var runSequence = require('run-sequence');
var browserSync = require('browser-sync');
var browserify = require('browserify');
var watchify = require('watchify');
var source = require('vinyl-source-stream');
var mainBowerFiles = require('main-bower-files');
var $ = require('gulp-load-plugins')();

var DEVELOPMENT = true;
var DESTINATION = './build';
var SRC = {
  <% if (includeSass) { %>
    styles: 'app/styles/**/*.{css,scss,sass}',
  <% } else { %>
    styles: 'app/styles/**/*.css',
  <% } %>
  scripts: './app/scripts/main.js',
  html: './app/**/*.html',
  fonts: 'app/fonts/**/*',
  images: 'app/images/**/*',
};

gulp.task('auto-reload', function() {
  var proc;

  gulp.watch('gulpfile.js', spawnChildren);
  spawnChildren();

  function spawnChildren(e) {
    if (proc) {
      proc.kill();
    }
    var args = argv.task ? argv.task : 'default';
    proc = spawn('gulp', [args], {
      stdio: 'inherit'
    });
  }
});

gulp.task('html', function() {
  return gulp.src(SRC.html)
    .pipe($.if(!DEVELOPMENT, $.htmlmin({
      collapseWhitespace: true,
      removeComments: true
    })))
    .pipe(gulp.dest(DESTINATION))
    .pipe($.size({
      title: 'html'
    }));
});

gulp.task('styles', function() {
  return gulp.src(SRC.styles)
    .pipe($.plumber())
    <% if (includeSass) { %>
    .pipe($.rubySass({
      style: DEVELOPMENT ? 'expanded' : 'compressed',
      "sourcemap=none": DEVELOPMENT ? false : true,
      sourcemapPath: '../sass'
    }))
    <% } %>
    .pipe($.autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe($.if(!DEVELOPMENT, $.minifyCss()))
    .pipe($.concat('main.css'))
    .pipe(gulp.dest(DESTINATION + '/css'))
    .pipe($.size({
      title: 'styles'
    }));
});

gulp.task('browserify', function() {
  var bundler = watchify(browserify({
    cache: {},
    packageCache: {},
    fullPaths: true,
    debug: !DEVELOPMENT,
    entries: SRC.scripts
  }));

  var bundle = function() {
    return bundler
      .bundle()
      .pipe($.plumber())
      .pipe(source('app.js'))
      .pipe($.if(!DEVELOPMENT, $.streamify($.uglify())))
      .pipe(gulp.dest(DESTINATION + '/js'));
  };

  bundler.on('update', bundle);
  return bundle();
});

gulp.task('fonts', function () {
  return gulp.src(mainBowerFiles().concat(SRC.fonts))
    .pipe($.filter('**/*.{eot,svg,ttf,woff}'))
    .pipe($.flatten())
    .pipe(gulp.dest(DESTINATION + '/fonts'));
});

gulp.task('images', function () {
  return gulp.src(SRC.images)
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest(DESTINATION + '/images'));
});

gulp.task('browser-sync', function() {
  return browserSync({
    server: DESTINATION,
    notify: false,
    open: false
  });
});

gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;
  <% if (includeSass) { %>
    gulp.src(SRC.styles)
      .pipe(wiredep())
      .pipe(gulp.dest('app/styles'));
  <% } %>
  gulp.src(SRC.html)
    .pipe(wiredep())
    .pipe(gulp.dest('app'));
});

gulp.task('watch', function() {
  gulp.watch(SRC.html, ['html']);
  gulp.watch(SRC.styles, ['styles']);
  gulp.watch(SRC.images, ['images']);
  gulp.watch(SRC.fonts, ['fonts']);
  gulp.watch('app/scripts/**/*.js', ['jshint']);
  gulp.watch('bower.json', ['wiredep']);
  gulp.watch(DESTINATION + "/**/*.*", function(file) {
    browserSync.reload(path.relative(__dirname, file.path));
  });
});

gulp.task('jshint', function(){
  return gulp.src('app/scripts/**/*.js')
    .pipe($.jshint())
    .pipe($.jshint.reporter('jshint-stylish'))
    .pipe($.jshint.reporter('fail'));
});

gulp.task('default', ['html', 'styles', 'browserify', 'watch', 'browser-sync', 'fonts', 'images', 'jshint'], function() {});
