'use strict';

module.exports = function (grunt) {

    //noinspection JSHint,JSHint
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: [
                    'public/javascripts/support/es5-sham.min.js',
                    'public/javascripts/support/angular.js',
                    'public/javascripts/support/zepto.js',
                    'public/javascripts/support/foundation.min.js',
                    'public/javascripts/support/custom.modernizr.js',
                    'public/javascripts/support/spin.min.js',
                    'public/javascripts/support/ladda.min.js',
                    'public/javascripts/support/underscore.js',
                    'public/javascripts/support/restangular.js',
                    'public/javascripts/support/socket.io.js',
                    'public/javascripts/zoltar/**/*.js'
                ],
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
                    'public/javascripts/dist/<%= pkg.name %>-<%= pkg.version %>.min.js': ['public/javascripts/dist/<%= pkg.name %>-<%= pkg.version %>.js']
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
                files: ['public/javascripts/zoltar/**/*.js',
                    'public/javascripts/support/**/*.js',
                    '!public/javascripts/dist/*.js'],
                tasks: ['concat']
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
                    debug: true
                }
            }
        }

    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-nodemon');
    grunt.loadNpmTasks('grunt-concurrent');

    grunt.registerTask('test', ['karma']);
    grunt.registerTask('build', ['concat', 'uglify']);

    grunt.registerTask('default', ['build', 'test']);

    grunt.registerTask('start', ['concurrent']);

};
