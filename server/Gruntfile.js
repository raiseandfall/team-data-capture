'use strict';


module.exports = function(grunt) {
  // grunt config
  grunt.initConfig({
    // load our main definition package
    pkg: grunt.file.readJSON('package.json'),

    /*
    * url: https://github.com/ai/autoprefixer
    * description: Autoprefixer uses the data on current browser popularity and properties support to apply prefixes for you:
      a { transition: transform 1s }
      become
      a {
        -webkit-transition: -webkit-transform 1s;
        transition: -ms-transform 1s;
        transition: transform 1s
      }
    */
    autoprefixer: {
      build: {
        options: {
          browsers: ['last 2 versions', '> 1%']
        },
        files: [
          {
            src : ['**/*.sass.css'],
            ext : '.autoprefixed.css',
            expand : true
          }
        ]
      }
    },

    /*
    * url: https://github.com/gruntjs/grunt-contrib-concat
    * description: concat all js plugin into one js file and concat the css prefixed with the icon and font css
    */
    concat: {
      options: {
        separator: ';',
        stripBanners: true,
        banner: '/*!\n<%= pkg.name %>\nv<%= pkg.version %>\n<%= grunt.template.today("mm-dd-yyyy") %>\nMade by <%= pkg.author.name %> - <%= pkg.author.url %>\n*/'
      },
      js: {
        src: ['assets/vendors/modernizr/modernizr.js', 'assets/js/*.js'],
        dest: 'assets/js/script.js'
      },
      css: {
        options: {
          separator: '',
        },
        src: ['public/css/style.autoprefixed.css' ],
        dest: 'public/css/style.css'
      }
    },

    /*
    * url: https://github.com/gruntjs/grunt-contrib-cssmin
    * description: minify the css
    */

    cssmin: {
      dist: {
        expand: true,
        cwd: 'public/css/',
        src: ['*.css', '!*.min.css', '!*.sass.css', '!*.autoprefixed.css'],
        dest: 'public/css/',
        ext: '.min.css'
      }
    },

    /*
    * https://github.com/gruntjs/grunt-contrib-sass
    * description: compile sass to css
    */
    sass: {
      build: {
        files : [
          {
            src : ['style.scss'],
            cwd : 'public/scss',
            dest : 'public/css/',
            ext : '.sass.css',
            expand : true
          }
        ],
        options : {
          style : 'expanded'
        }
      }
    },

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
          src: ['public/javascripts/*.js']
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

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-autoprefixer');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-develop');

  // dev = run jslint and all tests
  grunt.registerTask('scss', ['sass', 'autoprefixer', 'concat:css', 'cssmin']);

  // default = run jslint and all tests
  grunt.registerTask('default', ['scss', 'jshint','develop','nodeunit']);

  // dev = run jslint and all tests
  grunt.registerTask('dev', ['develop', 'watch']);
};
