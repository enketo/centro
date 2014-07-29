"use strict";

var express = require( 'express' ),
    router = express.Router();

module.exports = function( app ) {
    app.use( '/', router );
};

router.get( '/', function( req, res, next ) {

    res.render( 'index', {
        title: req.app.get( 'name' ) + ' - a brand new server for the ODK ecosystem'
    } );
} );
