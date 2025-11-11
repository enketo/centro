'use strict';

const router = require( 'express' ).Router();
const fs = require( 'fs' );
//const debug = require( 'debug' )( 'form controller' );
const manifest = require( '../models/formManifest' );
const path = require( 'path' );
const utils = require( '../lib/utils' );
const formStoragePath = path.resolve( __dirname, '../../storage/forms' );

module.exports = function( app ) {
    app.use( '/form', router );
};

router
    .param( 'formId', ( req, res, next, id ) => {
        req.formId = id;
        next();
    } )
    .param( 'filename', ( req, res, next, id ) => {
        req.filename = id;
        next();
    } );

router
    .get( '*', function( req, res, next ) {
        // console.log( 'xform/media Authorization request header', req.headers.authorization );
        next();
    } )
    .get( '/:formId/form.xml', ( req, res, next ) => {
        res.set( {
            'Content-Type': 'text/xml'
        } );
        fs.createReadStream( path.join( formStoragePath, req.formId + '.xml' ) ).pipe( res );
    } )
    .get( '/:formId/manifest.xml', ( req, res, next ) => {
        res.set( {
            'Content-Type': 'text/xml'
        } );
        manifest.get( req.formId, req.protocol + '://' + req.headers.host )
            .then( manifest => {
                res.send( manifest.toString() );
            } )
            .catch( next );
    } )
    .get( '/:formId/media/:filename', ( req, res, next ) => {
        try {
            // Sanitize the filename to prevent path traversal attacks
            const sanitizedFilename = utils.sanitizeFilename( req.filename );
            const file = fs.createReadStream( path.join( formStoragePath, req.formId + '-media', sanitizedFilename ) );
            res.contentType( req.params.filename );
            file.pipe( res );
        } catch ( error ) {
            // Return 400 Bad Request for invalid filenames
            const err = new Error( error.message );
            err.status = 400;
            next( err );
        }
    } );