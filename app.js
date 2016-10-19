"use strict";

var cluster = require( 'cluster' );
var numCPUs = require( 'os' ).cpus().length;

if ( cluster.isMaster ) {
    // Fork workers.
    for ( var i = 0; i < numCPUs; i++ ) {
        cluster.fork();
    }

    cluster.on( 'exit', function( worker, code, signal ) {
        console.log( 'Worker ' + worker.process.pid + ' sadly passed away. It will be reincarnated.' );
        cluster.fork();
    } );
} else {
    /*var express = require( 'express' ),
        fs = require( 'fs' ),
        config = require( './config/config' );

    var app = express();

    var controllersPath = __dirname + '/app/controllers';
    fs.readdirSync( controllersPath ).forEach( function( file ) {
        if ( file.indexOf( '.js' ) >= 0 ) {
            require( controllersPath + '/' + file )( app );
        }
    } );

    require( './config/express' )( app, config );

    var server = app.listen( app.get( 'port' ), function() {
        var worker = ( cluster.worker ) ? cluster.worker.id : 'Master';
        var msg = 'Worker ' + worker + ' ready for duty at port ' + server.address().port + '! (environment: ' + app.get( 'env' ) + ')';
        console.log( msg );
    } );*/

    var app = require( './config/express' );
    var server = app.listen( app.get( 'port' ), function() {
        var worker = ( cluster.worker ) ? cluster.worker.id : 'Master';
        var msg = 'Worker ' + worker + ' ready for duty at port ' + server.address().port + '! (environment: ' + app.get( 'env' ) + ')';
        console.log( msg );
    } );
    server.timeout = 6 * 60 * 1000;
}
