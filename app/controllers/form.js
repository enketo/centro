"use strict";

var router = require( 'express' ).Router(),
    fs = require( 'fs' ),
    debug = require( 'debug' )( 'form controller' ),
    form = require( '../models/form' ),
    path = require( 'path' ),
    formStoragePath = path.resolve( __dirname, '../../storage/forms' );

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
        form.getManifest( req.formId, req.headers.host )
            .then( function( manifest ) {
                res.send( manifest.toString() );
            } );
    } )
    .get( '/:formId/media/:filename', function( req, res, next ) {
        fs.createReadStream( path.join( formStoragePath, req.formId + '-media', req.filename ) ).pipe( res );
    } );
