'use strict';

let fs = require( 'fs' );
let path = require( 'path' );
let libxmljs = require( 'libxmljs' );
let MediaFile = require( './MediaFile' );
let debug = require( 'debug' )( 'formManifest model' );

const FORMSTORAGEPATH = path.resolve( __dirname, '../../storage/forms' );

function getManifest( id, baseUrl ) {
    let mediaFile;
    let doc = new libxmljs.Document();
    let manifest = doc.node( 'manifest' );
    let tasks = [];

    manifest.namespace( 'http://openrosa.org/xforms/xformsManifest' );

    return new Promise( function( resolve, reject ) {
        fs.readdir( path.join( FORMSTORAGEPATH, id + '-media' ), function( error, files ) {
            if ( error || files.length === 0 ) {
                reject( error );
            } else {
                files.forEach( function( file ) {
                    if ( file.indexOf( '.' ) !== 0 ) {
                        tasks.push( new MediaFile( file, id ).getProperties( baseUrl ) );
                    }
                } );

                return Promise.all( tasks )
                    .then( function() {
                        arguments[ 0 ].forEach( function( mediaObj ) {
                            mediaFile = manifest.node( 'mediaFile' );
                            for ( let property in mediaObj ) {
                                mediaFile.node( property, mediaObj[ property ] );
                            }
                        } );
                        resolve( manifest );
                    } )
                    .catch( function( error ) {
                        debug( 'error in manifest creation', error );
                        reject( error );
                    } );
            }
        } );
    } );
}

module.exports = {
    get: getManifest
};
