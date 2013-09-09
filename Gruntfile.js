'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: require('./package.json'),

    ngmin: {
      zoltar: {
        cwd: 'public/javascripts/zoltar',
        expand: true,
        src: ['**/*.js'],
        dest: 'public/javascripts/dist/generated'
      }
    },

    uglify: {
      options: {
        report: 'min',
        sourceMap: 'public/javascripts/dist/<%=' +
          ' pkg.name %>-<%= pkg.version %>.map.js',
        sourceMapRoot: '/',
        sourceMapPrefix: 1,
        sourceMappingURL: '/javascripts/dist/<%=' +
          ' pkg.name %>-<%= pkg.version %>.map.js'
      },
      dist: {
        files: {
          /*jshint maxlen:false*/
          'public/javascripts/dist/<%= pkg.name %>-<%= pkg.version %>.min.js': require('./support.json')
            .concat('public/javascripts/dist/generated/**/*.js')
        }
      }
    },

    karma: {
      unit: {
        configFile: 'karma.conf.js'
      }
    },

    watch: {
      scripts: {
        files: [
          'public/schemas/*.json',
          'public/javascripts/zoltar/**/*.js',
          'public/javascripts/support/**/*.js',
          '!public/javascripts/dist/**/*.js'
        ],
        tasks: ['build']
      }
      //      serverTests: {
      //        files: ['config/**/*.js', 'server.js', 'models/**/*.js',
      //          'routes/**/*.js', 'utils/**/*.js', 'spec/**/*.js',
      //          'public/schemas/**/*.json'],
      //        tasks: ['jasmine_node']
      //      },
      //      clientTests: {
      //        files: ['public/test/spec/**/*.js', 'public/javascripts/zoltar/**/*.js',
      //          'public/javascripts/support/**/*.js'],
      //        tasks: ['karma']
      //      }
    },

    concurrent: {
      target: {
        tasks: ['build', 'watch', 'nodemon'],
        options: {
          logConcurrentOutput: true
        }
      }
    },

    jasmine_node: {
      projectRoot: "./spec"
    },

    nodemon: {
      dev: {
        options: {
          file: 'server.js',
          watchedExtensions: ['js'],
          ignoredFiles: ['node_modules/**', 'public/**'],
          nodeArgs: ['--debug']
        }
      }
    },

    docular: {
      showAngularDocs: true,
      groups: [
        {
          groupTitle: 'Zoltar Client',
          groupId: 'client',
          sections: [
            {
              id: 'zoltar',
              title: 'Application',
              showSource: true,
              scripts: [
                'public/javascripts/zoltar/zoltar.js'
              ]
            },
            {
              id: 'zoltarIndex',
              title: 'Main Page',
              showSource: true,
              scripts: [
                'public/javascripts/zoltar/index/index.js'
              ]
            },
            {
              id: 'zoltarAdmin',
              title: 'Admin Console',
              showSource: true,
              scripts: [
                'public/javascripts/zoltar/admin/admin.js'
              ]
            },
            {
              id: 'zoltarCommon',
              title: 'Common Functionality',
              showSource: true,
              scripts: [
                'public/javascripts/zoltar/common/loginctrl.js',
                'public/javascripts/zoltar/common/headerctrl.js',
                'public/javascripts/zoltar/common/socket.js',
                'public/javascripts/zoltar/common/placeholder.js',
                'public/javascripts/zoltar/common/ladda.js',
                'public/javascripts/zoltar/common/schema.js'

              ]
            }
          ]
        },
        {
          groupTitle: 'Zoltar Server',
          groupId: 'server',
          showSource: false,
          sections: [
            {
              id: 'utils',
              title: 'Utilities',
              scripts: [

              ]
            },
            {
              id: 'models',
              title: 'Models',
              scripts: [
                'models/index.js'
              ]
            }
          ]
        }
      ]
    },

    jshint: {
      files: ['**/*.js'],
      options: {
        jshintrc: './.jshintrc',
        ignores: [
          'node_modules/**/*.js',
          'public/javascripts/support/**/*.js',
          'public/test/support/**/*.js',
          'public/javascripts/dist/**/*.js'
        ]
      }
    },

    cssmin: {
      combine: {
        files: {
          'public/stylesheets/dist/generated/zoltar.css':
            require('./stylesheets.json')
        }
      },
      minify: {
        expand: true,
        cwd: 'public/stylesheets/dist/generated',
        src: ['*.css'],
        dest: 'public/stylesheets/dist',
        ext: '.min.css'
      }

    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-docular');
  grunt.loadNpmTasks('grunt-ngmin');
  grunt.loadNpmTasks('grunt-jasmine-node');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('test', ['jshint', 'jasmine_node']);
  grunt.registerTask('build', ['ngmin', 'uglify', 'cssmin']);
  grunt.registerTask('default', ['build', 'test']);
  grunt.registerTask('start', ['concurrent']);

};
