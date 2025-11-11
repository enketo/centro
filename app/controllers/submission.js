'use strict';

const router = require( 'express' ).Router();
const busboy = require( 'busboy' );
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
        res.status( 204 );
        res.end();
    } )
    .post( '/', ( req, res, next ) => {
        const bb = busboy( {
            headers: req.headers
        } );

        bb.on( 'file', ( fieldname, stream, filename, transferEncoding, mimeType ) => {
            //if ( fieldname === 'xml_submission_file' ) { }
            console.log( 'file:', fieldname, filename, mimeType, stream );
            // do nothing with stream
            stream.resume();
        } );

        // What to do? 
        // Save as temporary files and pass the paths to the submission model?
        // Pass XML submission as string?
        // What would work the best under heavy load?
        bb.on( 'close', () => {
            //return submission.set( xmlData, files)
            return Promise.resolve({ status: 201, xml: '<ok/>' })
            .then( function( response ) {
                res.set( {
                    'Content-Type': 'text/xml'
                } );
                res.status(response.status)
                    .send( response.xml );
            } )
            .catch( next );
        });

        bb.on('error', next);

        req.pipe( bb );
    } )
    .put( '/*', function( req, res, next ) {
        console.log( 'put' );
        //const bb = busboy( {   headers: req.headers} );

        setTimeout( function() {
            console.log( 'going to return OK' );
            res.status( 201 ).send( '<ok/>' );
        }, 0.2 * 1000 );
        //req.pipe( bb );

    } )
    .all( '*', function( req, res, next ) {
        res.status( 405 );
        res.send( 'you are bad!' );
    } );