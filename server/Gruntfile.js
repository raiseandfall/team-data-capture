'use strict';


module.exports = function(grunt) {
  // grunt config
  grunt.initConfig({
    // grunt-contrib-jshint
    jshint: {
      files: [
        '**/*.js',
        '!node_modules/**/*js'
      ],
      options: {
        jshintrc: '.jshintrc',
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
        files: ['<%= jshint.files %>'],
        tasks: ['jshint'],
        options: {
          interrupt: true
        }
      },
      nodeunit: {
        files: 'test/**/*.js',
        tasks: ['nodeunit']
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
