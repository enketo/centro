"use strict";

var crypto = require( 'crypto' ),
    debug = require( 'debug' )( 'utils' );

function _md5( message ) {
    var hash = crypto.createHash( 'md5' );
    hash.update( message );
    return hash.digest( 'hex' );
}

module.exports = {
    md5: _md5
};
