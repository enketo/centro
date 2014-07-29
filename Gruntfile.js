'use strict';

module.exports = function( grunt ) {
    // show elapsed time at the end
    require( 'time-grunt' )( grunt );
    // load all grunt tasks
    require( 'load-grunt-tasks' )( grunt );

    var reloadPort = 35730,
        files;

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
                    //nodeArgs: [ '--debug' ],
                    callback: function( nodemon ) {
                        nodemon.on( 'restart', function() {
                            setTimeout( function() {
                                require( 'fs' ).writeFileSync( '.rebooted', 'rebooted' );
                            }, 1000 );
                        } );
                    },
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
        jsbeautifier: {
            test: {
                src: [ "**/*.js", "!node_modules/**" ],
                options: {
                    config: "./.jsbeautifyrc",
                    mode: "VERIFY_ONLY"
                }
            },
            fix: {
                src: [ "**/*.js", "!node_modules/**" ],
                options: {
                    config: "./.jsbeautifyrc"
                }
            }
        },
        jshint: {
            options: {
                jshintrc: ".jshintrc"
            },
            all: [ "**/*.js", "!public/components/**", "!node_modules/**" ]
        },
    } );

    grunt.registerTask( 'test', [ 'jshint', 'jsbeautifier:test' ] );
    grunt.registerTask( 'build', [ 'sass' ] );
    grunt.registerTask( 'develop', [ 'concurrent:develop' ] );
    grunt.registerTask( 'default', [ 'jshint', 'jsbeautifier:test' ] );
};
