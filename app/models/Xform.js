'use strict';

let fs = require( 'fs' );
let path = require( 'path' );
let url = require( 'url' );
let utils = require( '../lib/utils' );
let libxmljs = require( 'libxmljs' );
let debug = require( 'debug' )( 'Xform model' );

// TODO move
const FORMSTORAGEPATH = path.resolve( __dirname, '../../storage/forms' );


/**
 * XForm Class
 * @param {[type]} id [description]
 */
function Xform( id ) {
    let xform = this;
    const xformPath = path.join( FORMSTORAGEPATH, id + '.xml' );

    this.id = id;

    this.initialize = function() {
        return new Promise( function( resolve, reject ) {
            // mimicking future async db query
            fs.readFile( xformPath, 'utf-8', function( error, data ) {
                if ( error ) {
                    reject( error );
                } else {
                    xform.data = data;
                    //that.data = '<data>dfdsa';
                    try {
                        xform.doc = libxmljs.parseXml( xform.data );
                        xform.namespaces = xform._getNamespaces();
                        //debug( 'defaultNamespace', JSON.stringify( that.defaultNamespace[ 0 ] ) );
                        resolve( true );
                    } catch ( e ) {
                        let err = new Error( 'XML Error in form "' + xform.id + '": ' + JSON.stringify( e ) );
                        reject( err );
                    }
                }
            } );
        } );
    };
}

Xform.prototype.getProperties = function( baseUrl, verbose ) {
    let props;
    let xform = this;

    return this.initialize()
        .then( function() {
            props = {
                formID: xform._getFormId(),
                name: xform._getName(),
                majorMinorVersion: xform._getMajorMinorVersion(),
                version: xform._getVersion(),
                hash: xform._getHash(),
                downloadUrl: xform._getDownloadUrl( baseUrl )
            };
            if ( verbose ) {
                props.descriptionText = xform._getDescriptionText();
                props.descriptionUrl = xform._getDescriptionUrl();
            }

            return xform._getManifestUrl( baseUrl )
                .then( function( manifestUrl ) {
                    if ( manifestUrl ) {
                        props.manifestUrl = manifestUrl;
                    }
                    return props;
                } );
        } );
};

Xform.prototype._getNamespaces = function() {
    // TODO: extract these from this.doc instead
    return {
        xmlns: 'http://www.w3.org/2002/xforms',
        h: 'http://www.w3.org/1999/xhtml',
        jr: 'http://openrosa.org/javarosa',
        orx: 'http://openrosa.org/xforms',
        xsd: 'http://www.w3.org/2001/XMLSchema',
        ev: 'http://www.w3.org/2001/xml-events'
    };
};

Xform.prototype._getFormId = function() {
    let id = this.doc.get( '//xmlns:model/xmlns:instance/node()[@id]', this.namespaces );
    if ( !id ) {
        throw new Error( 'id attribute not found for form "' + this.id + '"' );
    }
    // there has to be a better way to get this id and version...
    id = id.attr( 'id' ).toString();
    return id.substring( 5, id.length - 1 );
};

Xform.prototype._getName = function() {
    let title = this.doc.get( '//h:head/h:title', this.namespaces );

    if ( !title ) {
        throw new Error( 'title element not found for form "' + this.id + '"' );
    }
    return title.text();
};

Xform.prototype._getMajorMinorVersion = function() {
    return '';
};

Xform.prototype._getVersion = function() {
    let version = this.doc.get( '//xmlns:model/xmlns:instance/node()[@version]', this.namespaces );
    if ( !version ) {
        return '';
    }
    // there has to be a better way to get this version...
    version = version.attr( 'version' ).toString();
    return version.substring( 10, version.length - 1 );
};

Xform.prototype._getHash = function() {
    return 'md5:' + utils.md5( this.data );
};

Xform.prototype._getDescriptionText = function() {
    return this._getName();
};

Xform.prototype._getDescriptionUrl = function() {
    return '';
};

Xform.prototype._getDownloadUrl = function( baseUrl ) {
    return url.resolve( baseUrl, path.join( 'form', this.id, 'form.xml' ) );
};

Xform.prototype._getManifestUrl = function( baseUrl ) {
    let xform = this;

    return new Promise( function( resolve, reject ) {
        fs.readdir( path.join( FORMSTORAGEPATH, xform.id + '-media' ), function( error, files ) {
            if ( error || files.length === 0 ) {
                resolve( null );
            } else {
                resolve( url.resolve( baseUrl, path.join( '/form/', xform.id, '/manifest.xml' ) ) );
            }
        } );
    } );
};

module.exports = Xform;
