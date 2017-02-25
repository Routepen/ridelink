'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();
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

app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// index
app.get('/', function (req, res) {
	res.render('driver_maps');
});

app.post('/auth/facebook', function (req, res) {});
app.post('/auth/facebook/callback', function (req, res) {});
app.post('/logout', function (req, res) {});
app.post('/addroute/', function (req, res) {

	res.sendStatus(200);
});

app.listen(app.get('port'), function () {
	console.log('running on port', app.get('port'));
});

//# sourceMappingURL=index-compiled.js.map