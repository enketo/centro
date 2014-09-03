"use strict";

// TODO: test and improve error handling (e.g invalid XML)

var fs = require( 'fs' ),
    Q = require( 'q' ),
    crypto = require( 'crypto' ),
    path = require( 'path' ),
    url = require( 'url' ),
    utils = require( '../lib/utils' ),
    libxmljs = require( "libxmljs" ),
    debug = require( 'debug' )( 'form model' ),
    FORMSTORAGEPATH = path.resolve( __dirname, '../../storage/forms' );

module.exports = {
    getXFormList: getXFormList,
    getManifest: getManifest
};

function getXFormList( baseUrl, formId, verbose ) {
    var xform, id,
        formList = new libxmljs.Document(),
        deferred = Q.defer(),
        xforms = formList.node( 'xforms' ),
        tasks = [];

    // set namespace
    xforms.namespace( "http://openrosa.org/xforms/xformsList" );

    // find the forms in storage
    fs.readdir( FORMSTORAGEPATH, function( error, files ) {
        if ( error ) {
            deferred.reject( error );
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
            Q.all( tasks )
                .then( function() {
                    arguments[ 0 ].forEach( function( formObj ) {
                        xform = xforms.node( 'xform' );
                        for ( var property in formObj ) {
                            xform.node( property, formObj[ property ] );
                        }
                    } );
                    deferred.resolve( formList );
                } )
                .catch( function( error ) {
                    debug( 'error in getXFOrmList', error );
                    deferred.reject( error );
                } );
        }
    } );

    return deferred.promise;
}

function getManifest( id, baseUrl ) {
    var mediaFile,
        doc = new libxmljs.Document(),
        manifest = doc.node( 'manifest' ),
        deferred = Q.defer(),
        tasks = [];

    manifest.namespace( "http://openrosa.org/xforms/xformsManifest" );

    fs.readdir( path.join( FORMSTORAGEPATH, id + '-media' ), function( error, files ) {
        if ( error || files.length === 0 ) {
            deferred.reject( error );
        } else {
            files.forEach( function( file ) {
                tasks.push( new MediaFile( file, id ).getProperties( baseUrl ) );
            } );

            Q.all( tasks )
                .then( function() {
                    arguments[ 0 ].forEach( function( mediaObj ) {
                        mediaFile = manifest.node( 'mediaFile' );
                        for ( var property in mediaObj ) {
                            mediaFile.node( property, mediaObj[ property ] );
                        }
                    } );
                    deferred.resolve( manifest );
                } )
                .catch( function( error ) {
                    debug( 'error in manifest creation', error );
                    deferred.reject( error );
                } );

        }
    } );

    return deferred.promise;
}

/**
 * XForm Class
 * @param {[type]} id [description]
 */
function Xform( id ) {
    var that = this,
        deferred = Q.defer(),
        xformPath = path.join( FORMSTORAGEPATH, id + '.xml' );

    this.id = id;

    // mimicking future async db query
    fs.readFile( xformPath, 'utf-8', function( error, data ) {
        if ( error ) {
            deferred.reject( error );
        } else {
            that.data = data;
            //that.data = '<data>dfdsa';
            try {
                that.doc = libxmljs.parseXml( that.data );
                that.namespaces = that._getNamespaces();

                //debug( 'defaultNamespace', JSON.stringify( that.defaultNamespace[ 0 ] ) );
                deferred.resolve( true );
            } catch ( e ) {
                var err = new Error( 'XML Error in form "' + that.id + '": ' + JSON.stringify( e ) );
                deferred.reject( err );
            }
        }
    } );

    this.initialize = function() {
        return deferred.promise;
    };
}

Xform.prototype.getProperties = function( baseUrl, verbose ) {
    var props, manifestUrl,
        xform = this;

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
        xmlns: "http://www.w3.org/2002/xforms",
        h: "http://www.w3.org/1999/xhtml",
        jr: "http://openrosa.org/javarosa",
        orx: "http://openrosa.org/xforms/",
        xsd: "http://www.w3.org/2001/XMLSchema",
        ev: "http://www.w3.org/2001/xml-events"
    };
};

Xform.prototype._getFormId = function() {
    var id;

    id = this.doc.get( '//xmlns:model/xmlns:instance/node()[@id]', this.namespaces );
    if ( !id ) {
        throw new Error( 'id attribute not found for form "' + this.id + '"' );
    }
    // there has to be a better way to get this id and version...
    id = id.attr( 'id' ).toString();
    return id.substring( 5, id.length - 1 );
};

Xform.prototype._getName = function() {
    var title = this.doc.get( '//h:head/h:title', this.namespaces );

    if ( !title ) {
        throw new Error( 'title element not found for form "' + this.id + '"' );
    }
    return title.text();
};

Xform.prototype._getMajorMinorVersion = function() {
    return '';
};

Xform.prototype._getVersion = function() {
    var version;

    version = this.doc.get( '//xmlns:model/xmlns:instance/node()[@version]', this.namespaces );
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
    var xform = this,
        deferred = Q.defer();

    fs.readdir( path.join( FORMSTORAGEPATH, this.id + '-media' ), function( error, files ) {
        if ( error || files.length === 0 ) {
            deferred.resolve( null );
        } else {
            deferred.resolve( url.resolve( baseUrl, path.join( '/form/', xform.id, '/manifest.xml' ) ) );
        }
    } );

    return deferred.promise;
};


/**
 * MediaFile Class
 * @param {[type]} filename [description]
 * @param {[type]} id       [description]
 */
function MediaFile( filename, id ) {
    var that = this,
        deferred = Q.defer(),
        mediaPath = path.join( FORMSTORAGEPATH, id + '-media', filename );

    this.id = id;
    this.filename = filename;

    fs.readFile( mediaPath, function( error, data ) {
        if ( error ) {
            deferred.reject( error );
        } else {
            that.content = data;
            deferred.resolve( true );
        }
    } );

    this.initialize = function() {
        return deferred.promise;
    };
}

MediaFile.prototype.getProperties = function( baseUrl ) {
    var mediaFile = this;

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
