'use strict';

module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
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
        sourceMap: 'public/javascripts/dist/<%= pkg.name %>-<%= pkg.version %>.map.js',
        sourceMapRoot: '/',
        sourceMapPrefix: 1,
        sourceMappingURL: '/javascripts/dist/<%= pkg.name %>-<%= pkg.version %>.map.js'
      },
      dist: {
        files: {
          /*jshint maxlength:false*/
          'public/javascripts/dist/<%= pkg.name %>-<%= pkg.version %>.min.js': [
            grunt.file.readJSON('sources.json').concat('public/javascripts/dist/generated/**/*.js')
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
          'public/schemas/*.json', 'public/javascripts/zoltar/**/*.js',
          'public/javascripts/support/**/*.js', '!public/javascripts/dist/*.js',
          'utils/**/*.js'
        ],
        tasks: ['ngmin', 'uglify', 'docular']
      },
      tests: {
        files: 'test/spec/*.js',
        tasks: ['test']
      }
    },

    concurrent: {
      target: {
        tasks: ['build', 'watch', 'nodemon'],
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
                'public/javascripts/zoltar/common/schema.js',
                'public/javascripts/zoltar/common/schemaform.js'

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
            },
            {
              id: 'models',
              title: 'Models',
              scripts: [
                'models/init.js'
              ]
            }
          ]
        }
      ]
    }
  });

  grunt.loadNpmTasks('grunt-karma');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-docular');
  grunt.loadNpmTasks('grunt-ngmin');

  grunt.registerTask('test', ['karma']);
  grunt.registerTask('build', ['ngmin', 'uglify', 'docular']);
  grunt.registerTask('default', ['build', 'test']);
  grunt.registerTask('start', ['concurrent']);

};
