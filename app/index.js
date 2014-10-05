'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var yosay = require('yosay');

var JartekGenerator = yeoman.generators.Base.extend({
  initializing: function() {
    if (this.args && this.args.length === 1) {
      this.destinationRoot(this.args[0]);
    }

    this.projectName = this.args[0] || this.appname;

    this.pkg = require('../package.json');
  },

  prompting: function() {
    var done = this.async();

    if (!this.options['skip-welcome']) {
      this.log(yosay(
        'Welcome to the fantastic Jartek generator!'
      ));
    }

    var prompts = [{
      type: 'list',
      name: 'cssPreprocessor',
      message: 'Pick a pre processor: ',
      choices: ['None', 'SCSS'],
      default: 'None'
    },{
      type: 'list',
      name: 'jsFramework',
      message: 'Pick a JS framework',
      choices: ['None'],
      default: 'None'
    }];

    this.prompt(prompts, function(props) {
      this.includeSass = (props.cssPreprocessor === "SCSS");
      done();
    }.bind(this));
  },

  writing: {
    app: function() {
      this.dest.mkdir('app');
      this.dest.mkdir('app/styles');
      this.dest.mkdir('app/scripts');

      if (this.includeSass) {
        this.src.copy('styles/main.scss', 'app/styles/main.scss');
      } else {
        this.src.copy('styles/main.css', 'app/styles/main.css');
      }

      this.src.copy('scripts/main.js', 'app/scripts/main.js');

      this.template('_Gulpfile.js', 'Gulpfile.js');
      this.template('_package.json', 'package.json');
      this.template('_bower.json', 'bower.json');
    },

    projectfiles: function() {
      this.src.copy('editorconfig', '.editorconfig');
      this.src.copy('jshintrc', '.jshintrc');
      this.src.copy('gitignore', '.gitignore');
    }
  },

  end: function() {
    if (!this.options['skip-install']) {
      this.installDependencies();
    }
  }
});

module.exports = JartekGenerator;
