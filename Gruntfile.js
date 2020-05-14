'use strict';

module.exports = function( grunt ) {
    // load all grunt tasks
    require( 'load-grunt-tasks' )( grunt );

    var reloadPort = 35730;

    grunt.initConfig( {
        pkg: grunt.file.readJSON( 'package.json' ),
        // development-mode that runs both nodemon and watch concurrently
        // to take care of automatically rebooting server and reloading page
        concurrent: {
            develop: {
                tasks: [ 'nodemon', 'watch' ],
                options: {
                    logConcurrentOutput: true
                }
            }
        },
        nodemon: {
            dev: {
                script: './app.js',
                options: {
                    watch: [ 'app', 'config' ],
                    env: {
                        NODE_ENV: 'development',
                        DEBUG: '*, -express:*, -send'
                    }
                }
            }
        },
        watch: {
            options: {
                nospawn: true,
                livereload: reloadPort
            },
            js: {
                files: [
                    'app.js',
                    'app/**/*.js',
                    'config/*.js'
                ],
                tasks: [ 'develop' ]
            },
            views: {
                files: [
                    'app/views/*.jade',
                    'app/views/**/*.jade'
                ],
                options: {
                    livereload: reloadPort
                }
            }
        },
        sass: {
            compile: {
                files: {
                    'public/css/error.css': 'app/views/style/error.scss',
                    'public/css/main.css': 'app/views/style/main.scss'
                }
            }
        },
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec'
                },
                src: [ 'test/**/*.spec.js' ]
            }
        },
    } );

    grunt.registerTask( 'test', [ 'mochaTest' ] );
    grunt.registerTask( 'build', [ 'sass' ] );
    grunt.registerTask( 'develop', [ 'concurrent:develop' ] );
    grunt.registerTask( 'default', [ 'jshint', 'build' ] );
};