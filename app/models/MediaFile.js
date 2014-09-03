'use strict';

let url = require( 'url' );
let path = require( 'path' );
let fs = require( 'fs' );
let utils = require( '../lib/utils' );
let debug = require( 'debug' )( 'MediaFile model' );

// MOVE THIS
const FORMSTORAGEPATH = path.resolve( __dirname, '../../storage/forms' );

/**
 * MediaFile Class
 * @param {[type]} filename [description]
 * @param {[type]} id       [description]
 */
function MediaFile( filename, id ) {
    let that = this;
    const mediaPath = path.join( FORMSTORAGEPATH, id + '-media', filename );

    this.id = id;
    this.filename = filename;
    this.initialize = function() {
        return new Promise( function( resolve, reject ) {
            fs.readFile( mediaPath, function( error, data ) {
                if ( error ) {
                    reject( error );
                } else {
                    that.content = data;
                    resolve( true );
                }
            } );
        } );
    };
}

MediaFile.prototype.getProperties = function( baseUrl ) {
    let mediaFile = this;

    return this.initialize()
        .then( function() {
            return {
                filename: mediaFile._getFilename(),
                hash: mediaFile._getHash(),
                downloadUrl: mediaFile._getDownloadUrl( baseUrl )
            };
        } );
};

MediaFile.prototype._getFilename = function() {
    return this.filename;
};

MediaFile.prototype._getHash = function() {
    return 'md5:' + utils.md5( this.content );
};

MediaFile.prototype._getDownloadUrl = function( baseUrl ) {
    return url.resolve( baseUrl, path.join( '/form/', this.id, '/media', this.filename ) );
};

module.exports = MediaFile;
