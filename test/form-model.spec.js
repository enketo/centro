/* eslint-env mocha */

const chai = require( 'chai' );
const expect = chai.expect;
const chaiAsPromised = require( 'chai-as-promised' );

chai.use( chaiAsPromised );

describe( 'Form Model', () => {

    before( () => {} );

    afterEach( () => {} );

    it( 'requires comprehensive testing', () => {
        return expect( true ).to.equal( true );
    } );

} );