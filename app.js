const cluster = require( 'cluster' );
const numCPUs = require( 'os' ).cpus().length;

if ( cluster.isMaster ) {
    // Fork workers.
    for ( var i = 0; i < numCPUs; i++ ) {
        cluster.fork();
    }

    cluster.on( 'exit', ( worker, code, signal ) => {
        console.log( 'Worker ' + worker.process.pid + ' sadly passed away. It will be reincarnated.' );
        cluster.fork();
    } );
} else {
    const app = require( './config/express' );
    const server = app.listen( app.get( 'port' ), () => {
        let worker = ( cluster.worker ) ? cluster.worker.id : 'Master';
        let msg = 'Worker ' + worker + ' ready for duty at port ' + server.address().port + '! (environment: ' + app.get( 'env' ) + ')';
        console.log( msg );
    } );
    server.timeout = 6 * 60 * 1000;
}