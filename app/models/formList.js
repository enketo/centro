'use strict';

// TODO: test and improve error handling (e.g invalid XML)

let fs = require( 'fs' );
let path = require( 'path' );
let url = require( 'url' );
let utils = require( '../lib/utils' );
let Xform = require( './Xform' );
let libxmljs = require( 'libxmljs' );
let debug = require( 'debug' )( 'formList model' );

// TODO: remove
const FORMSTORAGEPATH = path.resolve( __dirname, '../../storage/forms' );


function getXFormList( baseUrl, formId, verbose ) {
    let xform;
    let id;
    let formList = new libxmljs.Document();
    let xforms = formList.node( 'xforms' );
    let tasks = [];

    // set namespace
    xforms.namespace( 'http://openrosa.org/xforms/xformsList' );

    return new Promise( function( resolve, reject ) {
        // find the forms in storage
        fs.readdir( FORMSTORAGEPATH, function( error, files ) {
            if ( error ) {
                reject( error );
            } else {
                files.forEach( function( file ) {
                    if ( file.indexOf( '.xml' ) >= 0 ) {
                        id = file.substring( 0, file.length - 4 );
                        // not efficient if formId provided
                        // a database solution should query the database for only the record with the
                        // requested formID
                        if ( formId && id === formId || !formId ) {
                            tasks.push( new Xform( id ).getProperties( baseUrl, verbose ) );
                        }
                    }
                } );
                return Promise.all( tasks )
                    .then( function() {
                        arguments[ 0 ].forEach( function( formObj ) {
                            xform = xforms.node( 'xform' );
                            for ( let property in formObj ) {
                                xform.node( property, formObj[ property ] );
                            }
                        } );
                        resolve( formList );
                    } )
                    .catch( function( error ) {
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
