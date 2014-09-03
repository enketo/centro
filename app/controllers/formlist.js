"use strict";

var router = require( 'express' ).Router(),
    debug = require( 'debug' )( 'formlist controller' ),
    form = require( '../models/form' );

module.exports = function( app ) {
    app.use( '/formlist', router );
    app.use( '/xformsList', router );
};

router.get( '/', function( req, res, next ) {
    form.getXFormList( req.protocol + '://' + req.headers.host, req.query.formID, req.query.verbose )
        .then( function( formList ) {
            res.set( {
                'Content-Type': 'text/xml'
            } );
            res.send( formList.toString() );
        } )
        .catch( next );
} );
