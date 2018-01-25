const crypto = require( 'crypto' );
//const debug = require( 'debug' )( 'utils' );

function _md5( message ) {
    let hash = crypto.createHash( 'md5' );
    hash.update( message );
    return hash.digest( 'hex' );
}

module.exports = {
    md5: _md5
};