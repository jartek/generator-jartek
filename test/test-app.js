/*global describe, beforeEach, it*/
'use strict';

var path = require('path');
var assert = require('yeoman-generator').assert;
var helpers = require('yeoman-generator').test;
var _ = require('underscore');

var prompts = {
  cssPreprocessor: 'None',
  jsFramework: 'None'
};

var options = {
  'skip-install': true,
  'skip-welcome': true
};

var expectedFiles = [
  'Gulpfile.js',
  'bower.json',
  'package.json',
  '.editorconfig',
  '.gitignore',
  '.jshintrc',

  'app/scripts/main.js'
];

describe('jartek:app', function() {
  beforeEach(function(done) {
    helpers.testDirectory(path.join(__dirname, 'temp'), function(err) {
      if (err) {
        return done(err);
      }

      this.runner = helpers.createGenerator('jartek', [
        '../../app', [
          helpers.createDummyGenerator(),
          'mocha:app'
        ]
      ]);

      this.runner.options = options;

      helpers.mockPrompt(this.runner, prompts);

      done();
    }.bind(this));
  });

  it('can be imported without blowing up', function() {
    var app = require('../app');
    assert(app !== undefined);
  });

  it('sets the project name', function(done) {
    this.runner.args = ['something'];
    this.runner.run({}, function() {
      assert.fileContent([
        ['package.json', /something/],
        ['bower.json', /something/]
      ]);

      done();
    });
  });

  it('generates correct files from default values', function(done) {
    this.runner.run({}, function() {
      assert.file([].concat(
        expectedFiles,
        'app/styles/main.css'
      ));

      assert.noFile([
        'app/styles/main.scss'
      ]);

      assert.fileContent([
        ['Gulpfile.js', /app\/styles\/\*\*\/\*\.css/],
      ]);

      assert.noFileContent([
        ['Gulpfile.js', /app\/styles\/\*\*\/\*\.{css\,scss\,sass}/],
        ['Gulpfile.js', /rubySass/],
        ['package.json', /sass/],
      ]);

      done();
    });
  });

  it('generates correct files with SASS', function(done) {
    helpers.mockPrompt(this.runner, _.extend(prompts, {
      cssPreprocessor: "SCSS"
    }));

    this.runner.run({}, function() {

      assert.file([].concat(
        expectedFiles,
        'app/styles/main.scss'
      ));

      assert.noFile([
        'app/styles/main.css'
      ]);

      assert.noFileContent([
        ['Gulpfile.js', /app\/styles\/\*\*\/\*\.css/]
      ]);

      assert.fileContent([
        ['Gulpfile.js', /app\/styles\/\*\*\/\*\.{css\,scss\,sass}/],
        ['Gulpfile.js', /rubySass/],
        ['package.json', /sass/],
      ]);

      done();
    });
  });
});
