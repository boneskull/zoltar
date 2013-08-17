'use strict';

module.exports = function (grunt) {

  //noinspection JSHint,JSHint
  grunt.initConfig(
      {
        pkg: grunt.file.readJSON('package.json'),
        concat: {
          dist: {
            src: grunt.file.readJSON('support.json'),
            dest: 'public/javascripts/dist/<%= pkg.name %>-' +
                  '<%= pkg.version %>.js'
          }
        },
        uglify: {
          options: {
            banner: '/*! <%= pkg.name %> <%= grunt.template.today' +
                    '("dd-mm-yyyy") %> */\n'
          },
          dist: {
            files: {
              /*jshint maxlength:false*/
              'public/javascripts/dist/<%= pkg.name %>-<%= pkg.version %>.min.js':
                  [
                    'public/javascripts/dist/<%= pkg.name %>-<%= pkg.version %>.js'
                  ]
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
              '!public/javascripts/dist/*.js',
              'utils/**/*.js'
            ],
            tasks: ['concat', 'docular']
          },
          tests: {
            files: 'test/spec/*.js',
            tasks: ['test']
          }
        },

        concurrent: {
          target: {
            tasks: ['build', 'nodemon', 'watch'],
            options: {
              logConcurrentOutput: true
            }
          }
        },

        nodemon: {
          dev: {
            options: {
              file: 'server.js',
              watchedExtensions: ['js'],
              ignoredFiles: ['node_modules/**'],
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
                    'public/javascripts/zoltar/common/controllers/loginctrl.js',
                    'public/javascripts/zoltar/common/socket.js',
                    'public/javascripts/zoltar/common/placeholder.js',
                    'public/javascripts/zoltar/common/ladda.js'
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
                    'utils/io.js'
                  ]

                }
              ]
            }
          ]
        }
      });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-docular');

  grunt.registerTask('test', ['karma']);
  grunt.registerTask('build', ['concat', 'uglify', 'docular']);
  grunt.registerTask('default', ['build', 'test']);
  grunt.registerTask('start', ['concurrent']);

};
