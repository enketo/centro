'use strict';

let router = require( 'express' ).Router();
let Busboy = require( 'busboy' );
let config = require( '../../config/config' );
// let submission = require( '../models/submission' );
let debug = require( 'debug' )( 'submission controller' );

module.exports = function( app ) {
    app.use( '/submission', router );
};

router
    .all( '*', function( req, res, next ) {
        let error;

        res.set( {
            'X-OpenRosa-Version': '1.0',
            'X-OpenRosa-Accept-Content-Length': config[ "max submission size" ] || 50 * 1024 * 1024
        } );

        if ( !req.headers[ 'x-openrosa-version' ] || req.headers[ 'x-openrosa-version' ] !== '1.0' ) {
            error = new Error( 'This server only supports OpenRosa 1.0 clients' );
            error.status = 400;
            next( error );
        } else {
            next();
        }
    } )
    .head( '/', function( req, res, next ) {
        res.status( 204 );
        res.end();
    } )
    .post( '/', function( req, res, next ) {
        let xmlData;
        let files;
        let busboy = new Busboy( {
            headers: req.headers
        } );

        busboy.on( 'file', function( fieldname, stream, filename, transferEncoding, mimeType ) {
            if ( fieldname === 'xml_submission_file' ) {

            }
            debug( 'file:', fieldname, filename, mimeType, stream );
        } );

        // What to do? 
        // Save as temporary files and pass the paths to the submission model?
        // Pass XML submission as string?
        // What would work the best under heavy load?

        busboy.on( 'finish', function() {
            /*return submission.set( xmlData, files)
            .then( function( response ) {
                res.set( {
                    'Content-Type': 'text/xml'
                } );
                res.status(response.status)
                res.send( response.xml );
            } )
            .catch( next );*/
        } );

        req.pipe( busboy );

    } ).all( '*', function( req, res, next ) {
        res.status( 405 );
        res.send( 'you is bad!' );
    } );
