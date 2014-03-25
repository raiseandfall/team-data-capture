'use strict';


module.exports = function(grunt) {
  // grunt config
  grunt.initConfig({
    // grunt-contrib-jshint
    jshint: {
      files: [
        '**/*.js',
        '!node_modules/**/*js',
        '!public/**/*.js'
      ],
      options: {
        jshintrc: '.jshintrc',
      },
      jspublic: {
        options: {
          jshintrc: 'public/javascripts/.jshintrc',
        },
        files: {
          src: ['public/**/*.js']
        },
      }
    },
    // grunt-develop
    develop: {
      server: {
        file: 'server.js'
      }
    },
    // grunt-contrib-watch
    watch: {
      jslint: {
        files: [
          '**/*.js',
          '!node_modules/**/*js'
        ],
        tasks: ['jshint'],
        options: {
          interrupt: true
        }
      },
      nodeunit: {
        files: 'test/**/*.js',
        tasks: ['nodeunit']
      },
      livereload: {
        options: {
          livereload: true
        },
        files: [
          'public/javascripts/{,*/}*.js',
          'public/stylesheets/{,*/}*.css',
          'views/{,*/}*.jade'
        ]
      }
    },
    // grunt-contrib-nodeunit
    nodeunit: {
      tests: ['test/*_test.js']
    }
  });

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-develop');

  // default = run jslint and all tests
  grunt.registerTask('default', ['jshint','develop','nodeunit']);

  // dev = run jslint and all tests
  grunt.registerTask('dev', ['develop', 'watch']);
};
