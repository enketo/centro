'use strict';

const url = require( 'url' );
const path = require( 'path' );
const fs = require( 'fs' );
const utils = require( '../lib/utils' );
// let debug = require( 'debug' )( 'MediaFile model' );

// MOVE THIS
const FORMSTORAGEPATH = path.resolve( __dirname, '../../storage/forms' );

class MediaFile {

    constructor( filename, id ) {
        this.mediaPath = path.join( FORMSTORAGEPATH, id + '-media', filename );
        this.id = id;
        this.filename = filename;
    }

    initialize() {
        const file = this;
        return new Promise( ( resolve, reject ) => {
            fs.readFile( this.mediaPath, ( error, data ) => {
                if ( error ) {
                    reject( error );
                } else {
                    file.content = data;
                    resolve( true );
                }
            } );
        } );
    }

    getProperties( baseUrl ) {
        let mediaFile = this;

        return this.initialize()
            .then( () => {
                return { filename: mediaFile._getFilename(), hash: mediaFile._getHash(), downloadUrl: mediaFile._getDownloadUrl( baseUrl ) };
            } );

    }

    _getFilename() { return this.filename; }

    _getHash() { return `md5: ${utils.md5( this.content)}`; }

    _getDownloadUrl( baseUrl ) { return url.resolve( baseUrl, path.join( '/form/', this.id, '/media', this.filename ) ); }

}

module.exports = MediaFile;