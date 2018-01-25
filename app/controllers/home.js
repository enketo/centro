'use strict';

const express = require( 'express' );
const router = express.Router();

module.exports = ( app ) => app.use( '/', router );

router.get( '/', ( req, res, next ) => {

    res.render( 'index', {
        title: req.app.get( 'name' ) + ' - a brand new server for the OpenRosa/ODK ecosystem'
    } );
} );