const express = require( 'express' );
const path = require( 'path' );
const fs = require( 'fs' );
const favicon = require( 'serve-favicon' );
const logger = require( 'morgan' );
const cookieParser = require( 'cookie-parser' );
const bodyParser = require( 'body-parser' );
const compress = require( 'compression' );
const config = require( './config' );
const controllersPath = path.join( __dirname, '../app/controllers' );
const app = express();

// configuration
app.set( 'views', './app/views' );
app.set( 'view engine', 'pug' );
for ( const item in config ) {
    app.set( item, app.get( item ) || config[ item ] );
}
app.set( 'port', process.env.PORT || app.get( 'port' ) || 3000 );
app.set( 'env', process.env.NODE_ENV || 'production' );

// pretty json API responses
app.set( 'json spaces', 4 );

// middleware
app.use( favicon( './public/img/favicon.ico' ) );
app.use( logger( 'dev' ) );
app.use( bodyParser.json() );
app.use( bodyParser.urlencoded( {
    extended: true
} ) );
app.use( cookieParser() );
app.use( compress() );
app.use( express.static( './public' ) );
// temp for form media with correct headers
app.use( '/form/video-label-demo/media/*', express.static( './storage/forms/video-label-demo-media' ) );

// set variables that should be accessible in all view templates
app.use( ( req, res, next ) => {
    res.locals.environment = app.get( 'env' );
    next();
} );

// load controllers (including routers)
fs.readdirSync( controllersPath ).forEach( file => {
    if ( file.indexOf( '.js' ) >= 0 ) {
        //debug( 'loading', file );
        require( `${controllersPath}/${file}` )( app );
    }
} );

// error handling
app.use( ( req, res, next ) => {
    const err = new Error( 'Not Found' );
    err.status = 404;
    next( err );
} );

if ( app.get( 'env' ) === 'development' ) {
    app.use( ( err, req, res, next ) => {
        const body = {
            code: err.status || 500,
            message: err.message
        };
        res.status( err.status || 500 );
        if ( res.get( 'Content-type' ) === 'application/json' ) {
            res.json( body );
        } else {
            res.render( 'error', body );
        }
    } );
}

app.use( ( err, req, res, next ) => {
    const body = {
        code: err.status || 500,
        message: err.message,
        stack: err.stack
    };
    res.status( err.status || 500 );
    if ( res.get( 'Content-type' ) === 'application/json' ) {
        res.json( body );
    } else {
        res.render( 'error', body );
    }
} );

module.exports = app;