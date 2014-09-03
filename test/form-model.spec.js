/* global describe, require, it, before, after, beforeEach, afterEach */
'use strict';

let chai = require( 'chai' );
let expect = chai.expect;
let chaiAsPromised = require( 'chai-as-promised' );
let config = require( "../config/config" );
let model = require( '../app/models/Xform' );

chai.use( chaiAsPromised );

describe( 'Form Model', function() {

    before( function() {} );

    afterEach( function() {} );

    it( 'requires comprehensive testing', function() {
        return expect( true ).to.equal( true );
    } );

} );
