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
        src: ['public/bower_components/two/build/two.js', 'public/js/modernizr.js', 'public/js/modules/*.js', 'public/js/app.js'],
        dest: 'public/javascripts/script.js'
      },
      css: {
        options: {
          separator: '',
        },
        src: ['public/stylesheets/style.autoprefixed.css' ],
        dest: 'public/stylesheets/style.css'
      }
    },

    /*
    * url: https://github.com/gruntjs/grunt-contrib-cssmin
    * description: minify the css
    */

    cssmin: {
      dist: {
        expand: true,
        cwd: 'public/stylesheets/',
        src: ['*.css', '!*.min.css', '!*.sass.css', '!*.autoprefixed.css'],
        dest: 'public/stylesheets/',
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
            dest : 'public/stylesheets/',
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
          jshintrc: 'public/js/.jshintrc',
        },
        files: {
          src: [
            'public/js/*.js',
            '!public/js/modernizr.js'
          ]
        },
      }
    },

    /*
    * url: https://github.com/Modernizr/grunt-modernizr
    * description: sifts through your project files, gathers up your references to Modernizr tests and outputs a lean, mean Modernizr machine.
    */
    modernizr: {
      dist: {
        'devFile' : 'public/js/modernizr-dev.js',
        'outputFile' : 'public/js/modernizr.js',
        'extra' : {
          'shiv' : true,
          'printshiv' : false,
          'load' : true,
          'mq' : true,
          'cssclasses' : true
        },
        'extensibility' : {
          'addtest' : false,
          'prefixed' : true,
          'teststyles' : false,
          'testprops' : false,
          'testallprops' : false,
          'hasevents' : false,
          'prefixes' : false,
          'domprefixes' : false
        },
        'uglify' : true,
        'tests' : ['csstransitions'],
        'parseFiles' : false,
        'matchCommunityTests' : false,
        'customTests' : []
      }
    },

    /*
    * url: https://github.com/gruntjs/grunt-contrib-uglify
    * description: Minify files with UglifyJS.
    */
    uglify: {
      options: {
        report: true
      },
      js: {
        files: {
          'public/javascripts/script.min.js': ['public/javascripts/script.js']
        }
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
      scss: {
        files: 'public/scss/*',
        tasks: ['scss']
      },
      js: {
        files: [
          'public/js/**/*',
          '!public/js/modernizr.js'
        ],
        tasks: ['js']
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

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-modernizr');

  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-develop');

  grunt.registerTask('js', ['jshint', 'modernizr', 'concat:js', 'uglify:js']);

  // dev = run jslint and all tests
  grunt.registerTask('scss', ['sass', 'autoprefixer', 'concat:css', 'cssmin']);

  // default = run jslint and all tests
  grunt.registerTask('default', ['scss', 'js', 'develop']);

  // dev = run jslint and all tests
  grunt.registerTask('dev', ['develop', 'watch']);
};
