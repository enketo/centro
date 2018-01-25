const router = require( 'express' ).Router();
// const debug = require( 'debug' )( 'formlist controller' );
const formList = require( '../models/formList' );

module.exports = function( app ) {
    app.use( '/formList', router );
    app.use( '/xformsList', router );
};

router
    .get( '*', ( req, res, next ) => {
        // console.log( 'formlist auth request header', req.headers.authorization );
        next();
    } )
    .get( '/', ( req, res, next ) => {
        formList.get( req.protocol + '://' + req.headers.host, req.query.formID, req.query.verbose )
            .then( ( formList ) => {
                res.set( {
                    'Content-Type': 'text/xml'
                } );
                res.send( formList.toString() );
            } )
            .catch( next );
    } );