const fs = require( 'fs' );
const path = require( 'path' );
const libxmljs = require( 'libxmljs' );
const MediaFile = require( './MediaFile' );
//const debug = require( 'debug' )( 'formManifest model' );

const FORMSTORAGEPATH = path.resolve( __dirname, '../../storage/forms' );

function getManifest( id, baseUrl ) {
    const doc = new libxmljs.Document();
    const manifest = doc.node( 'manifest' );
    const tasks = [];

    manifest.namespace( 'http://openrosa.org/xforms/xformsManifest' );

    return new Promise( ( resolve, reject ) => {
        fs.readdir( path.join( FORMSTORAGEPATH, id + '-media' ), ( error, files ) => {
            if ( error || files.length === 0 ) {
                reject( error );
            } else {
                files.forEach( file => {
                    if ( file.indexOf( '.' ) !== 0 ) {
                        tasks.push( new MediaFile( file, id ).getProperties( baseUrl ) );
                    }
                } );

                return Promise.all( tasks )
                    .then( results => {
                        results.forEach( mediaObj => {
                            const mediaFile = manifest.node( 'mediaFile' );
                            for ( const property in mediaObj ) {
                                mediaFile.node( property, mediaObj[ property ] );
                            }
                        } );
                        resolve( manifest );
                    } )
                    .catch( error => {
                        // debug( 'error in manifest creation', error );
                        reject( error );
                    } );
            }
        } );
    } );
}

module.exports = {
    get: getManifest
};