"use strict";
var express = require( 'express' );

var favicon = require( 'serve-favicon' );
var logger = require( 'morgan' );
var cookieParser = require( 'cookie-parser' );
var bodyParser = require( 'body-parser' );
var compress = require( 'compression' );

module.exports = function( app, config ) {

    // configuration
    app.set( 'views', './app/views' );
    app.set( 'view engine', 'jade' );
    for ( var item in config ) {
        app.set( item, app.get( item ) || config[ item ] );
    }
    app.set( 'port', process.env.PORT || app.get( "port" ) || 3000 );
    app.set( 'env', process.env.NODE_ENV || 'production' );

    // pretty json API responses
    app.set( 'json spaces', 4 );

    // middleware
    app.use( favicon( './public/img/favicon.ico' ) );
    app.use( logger( 'dev' ) );
    app.use( bodyParser.json() );
    app.use( bodyParser.urlencoded( {
        extended: true
    } ) );
    app.use( cookieParser() );
    app.use( compress() );
    app.use( express.static( './public' ) );

    // set variables that should be accessible in all view templates
    app.use( function( req, res, next ) {
        res.locals.environment = app.get( 'env' );
        next();
    } );

    // error handling
    app.use( function( req, res, next ) {
        var err = new Error( 'Not Found' );
        err.status = 404;
        next( err );
    } );

    if ( app.get( 'env' ) === 'development' ) {
        app.use( function( err, req, res, next ) {
            var body = {
                code: err.status || 500,
                message: err.message
            };
            res.status( err.status || 500 );
            if ( res.get( 'Content-type' ) === 'application/json' ) {
                res.json( body );
            } else {
                res.render( 'error', body );
            }
        } );
    }

    app.use( function( err, req, res, next ) {
        var body = {
            code: err.status || 500,
            message: err.message,
            stack: err.stack
        };
        res.status( err.status || 500 );
        if ( res.get( 'Content-type' ) === 'application/json' ) {
            res.json( body );
        } else {
            res.render( 'error', body );
        }
    } );

};
