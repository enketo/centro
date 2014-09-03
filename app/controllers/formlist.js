'use strict';

let router = require( 'express' ).Router();
let debug = require( 'debug' )( 'formlist controller' );
let formList = require( '../models/formList' );

module.exports = function( app ) {
    app.use( '/formList', router );
    app.use( '/xformsList', router );
};

router.get( '/', function( req, res, next ) {
    formList.get( req.protocol + '://' + req.headers.host, req.query.formID, req.query.verbose )
        .then( function( formList ) {
            res.set( {
                'Content-Type': 'text/xml'
            } );
            res.send( formList.toString() );
        } )
        .catch( next );
} );
