// TODO: test and improve error handling (e.g invalid XML)
const fs = require( 'fs' );
const path = require( 'path' );
const Xform = require( './Xform' );
const libxmljs = require( 'libxmljs' );
const debug = require( 'debug' )( 'formList model' );

// TODO: remove
const FORMSTORAGEPATH = path.resolve( __dirname, '../../storage/forms' );

function getXFormList( baseUrl, formId, verbose ) {
    const formList = new libxmljs.Document();
    const xforms = formList.node( 'xforms' );
    const tasks = [];

    // set namespace
    xforms.namespace( 'http://openrosa.org/xforms/xformsList' );

    return new Promise( ( resolve, reject ) => {
        // find the forms in storage
        fs.readdir( FORMSTORAGEPATH, ( error, files ) => {
            if ( error ) {
                reject( error );
            } else {
                files.forEach( file => {
                    if ( file.indexOf( '.xml' ) >= 0 ) {
                        const id = file.substring( 0, file.length - 4 );
                        // not efficient if formId provided
                        // a database solution should query the database for only the record with the
                        // requested formID
                        //console.log( 'checking', formId, id, formId === id );
                        //if ( formId && id === formId || !formId ) {
                        tasks.push( new Xform( id ).getProperties( baseUrl, verbose ) );
                        //}
                    }
                } );
                return Promise.all( tasks )
                    .then( results => {
                        results.forEach( formObj => {
                            const xform = xforms.node( 'xform' );
                            for ( const property in formObj ) {
                                xform.node( property, formObj[ property ] );
                            }
                        } );
                        resolve( formList );
                    } )
                    .catch( error => {
                        debug( 'error in getXFormList', error );
                        reject( error );
                    } );
            }
        } );
    } );
}

module.exports = {
    get: getXFormList
};