'use strict';

let router = require( 'express' ).Router();
let fs = require( 'fs' );
let debug = require( 'debug' )( 'form controller' );
let manifest = require( '../models/formManifest' );
let path = require( 'path' );
let formStoragePath = path.resolve( __dirname, '../../storage/forms' );

module.exports = function( app ) {
    app.use( '/form', router );
};

router
    .param( 'formId', function( req, res, next, id ) {
        req.formId = id;
        next();
    } )
    .param( 'filename', function( req, res, next, id ) {
        req.filename = id;
        next();
    } );

router
    .get( '/:formId/form.xml', function( req, res, next ) {
        res.set( {
            'Content-Type': 'text/xml'
        } );
        fs.createReadStream( path.join( formStoragePath, req.formId + '.xml' ) ).pipe( res );
    } )
    .get( '/:formId/manifest.xml', function( req, res, next ) {
        res.set( {
            'Content-Type': 'text/xml'
        } );
        manifest.get( req.formId, req.protocol + '://' + req.headers.host )
            .then( function( manifest ) {
                res.send( manifest.toString() );
            } )
            .catch( next );
    } )
    .get( '/:formId/media/:filename', function( req, res, next ) {
        fs.createReadStream( path.join( formStoragePath, req.formId + '-media', req.filename ) ).pipe( res );
    } );
