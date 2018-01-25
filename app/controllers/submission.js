'use strict';

const router = require( 'express' ).Router();
const Busboy = require( 'busboy' );
const config = require( '../../config/config' );
// const submission = require( '../models/submission' );
const debug = require( 'debug' )( 'submission controller' );
module.exports = ( app ) => {
    app.use( '/submission', router );
    app.use( '/fieldsubmission', router );
};

router
    .all( '*', ( req, res, next ) => {
        // console.log( 'submission request Authorization headers', req.headers.authorization );
        res.set( {
            'X-OpenRosa-Version': '1.0',
            'X-OpenRosa-Accept-Content-Length': config[ 'max submission size' ] || 50 * 1024 * 1024
        } );

        //if ( !req.headers[ 'x-openrosa-version' ] || req.headers[ 'x-openrosa-version' ] !== '1.0' ) {
        //    error = new Error( 'This server only supports OpenRosa 1.0 clients' );
        //    error.status = 400;
        //    next( error );
        //} else {
        next();
        //}
    } )
    .head( '/', ( req, res, next ) => {
        console.log( 'head' );
        res.status( 204 );
        res.end();
    } )
    .post( '/', ( req, res, next ) => {
        const busboy = new Busboy( {
            headers: req.headers
        } );

        debug( 'submission coming in from ', req.url, req.headers );

        busboy.on( 'file', ( fieldname, stream, filename, transferEncoding, mimeType ) => {
            //if ( fieldname === 'xml_submission_file' ) { }
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

        setTimeout( function() {
            console.log( 'going to return OK' );
            res.status( 201 ).send( '<ok/>' );
        }, 0.2 * 1000 );
        //req.pipe( busboy );

    } )
    .put( '/', function( req, res, next ) {
        console.log( 'put' );
        //const busboy = new Busboy( {   headers: req.headers} );

        setTimeout( function() {
            console.log( 'going to return OK' );
            res.status( 201 ).send( '<ok/>' );
        }, 1.5 * 1000 );
        //req.pipe( busboy );

    } ).all( '*', function( req, res, next ) {
        res.status( 405 );
        res.send( 'you is bad!' );
    } );