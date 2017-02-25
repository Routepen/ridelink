/**
 * Created by Victor on 2/24/2017.
 */
var pg = require('pg');
var config = {
    user: 'ufqemniwfnsinx', //env var: PGUSER
    database: 'db8e745tt9v189', //env var: PGDATABASE
    password: 'd2caccc6c09c2b43b984f5507ed5930151532c76a20e0d9f979559a40d2ea81a', //env var: PGPASSWORD
    host: 'ec2-23-21-96-70.compute-1.amazonaws.com', // Server hosting the postgres database
    port: 5432, //env var: PGPORT
    max: 10, // max number of clients in the pool
    ssl: true
    //	idleTimeoutMillis: 30000, // how long a client is allowed to remain idle before being closed
};
var pool = new pg.Pool(config);

pool.on('error', function (err, client) {
    console.error('idle client error', err.message, err.stack);
});

pool.query('');

//# sourceMappingURL=database-compiled.js.map