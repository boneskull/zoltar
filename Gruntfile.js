module.exports = function (grunt) {


    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            dist: {
                src: ['public/javascripts/**/*.js', '!public/javascripts/<%= pkg.name %>-<%= pkg.version %>.js'],
                dest: 'public/javascripts/<%= pkg.name %>-<%= pkg.version %>.js'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
            },
            dist: {
                files: {
                    'public/javascripts/<%= pkg.name %>-<%= pkg.version %>.min.js': ['public/javascripts/<%= pkg.name %>-<%= pkg.version %>.js']
                }
            }
        },
        jshint: {
            all: ['Gruntfile.js', 'public/javascripts/**/*.js', '!public/javascripts/lib/**/*.js', 'test/spec/*.js']
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        },
        watch: {
            scripts: {
                files: 'public/javascripts/**/*.js',
                tasks: ['test']
            },
            tests: {
                files: 'test/spec/*.js',
                tasks: ['test']
            }
        }

    });

    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.registerTask('test', ['jshint', 'karma']);
    grunt.registerTask('build', ['concat', 'uglify']);
    grunt.registerTask('default', ['build']);

};
