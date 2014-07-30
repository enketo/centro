/* global describe, require, it, before, after, beforeEach, afterEach */
"use strict";

var Q = require( "q" ),
    chai = require( "chai" ),
    expect = chai.expect,
    chaiAsPromised = require( "chai-as-promised" ),
    config = require( "../config/config" ),
    model = require( '../app/models/form' );

chai.use( chaiAsPromised );

describe( 'Form Model', function() {

    before( function() {} );

    afterEach( function() {} );

    it( 'requires comprehensive testing', function() {
        return expect( true ).to.equal( true );
    } );

} );
