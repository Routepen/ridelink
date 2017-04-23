'use strict'
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const mongoose = require('mongoose');
const session = require('express-session');
const User = require('./models/User');
const Route = require('./models/Route');
const util = require('util');
const _ = require("lodash");
const app = express();
const GoogleMapsAPI = require('googlemaps');
const geocode = require('./geocode');
const async = require('async');

const auth = require("./auth");
const mail = require("./mail");
const payment = require("./payments");


mongoose.Promise = require('bluebird');

var mongo_url = 'mongodb://127.0.0.1:27017/ridelink' || process.env.MONGODB_URI;
console.log(mongo_url);
  mongoose.connect(mongo_url,  {
  server: {
    socketOptions: {
      socketTimeoutMS: 0,
      connectTimeoutMS: 0
    }
  }
});
var db = mongoose.connection;

var publicConfig = {
	key: process.env.GMAPI_KEY,
	//key: process.env.GOOGLE_MAPS_KEY,
	stagger_time:       1000, // for elevationPath
	encode_polylines:   false,
	secure:             true, // use https
};
var gmAPI = new GoogleMapsAPI(publicConfig);

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("we're connected!");
});


app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// parse cookie sessions
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: "Thisshouldbemademoresecure"
}));

// parse application/json
app.use(bodyParser.json());

auth.setUpAuth(app);
payment.setUp(app, mail, Route);

app.get('/', function (req, res) {
	var data = {
		user: req.user,
		url: req.url
	};

	res.render('new_landing', data);
});


require("./backend/routes/routes")(app, Route, User, mail, geocode, gmAPI);


app.get('/profile', function(req, res){
	res.render('profile');
});

app.get('/route/mine', function(req, res){
	if (!req.user) {
		return res.redirect("/auth/facebook?redirect=" + encodeURIComponent('/route/mine'));
	}

	Route.find({ _id: {$in:req.user.routes}}, function(err, routes) {
		var data = {
			user: req.user || false,
			url: req.url,
			routes: routes
		};

		res.render('userRoutes', data);
	});
});

// For testing purposes only
app.get('/rider', function (req, res) {
	res.render('partials/driver_input');
});

function random(len) {
	var a = new Array(len);
	var ranges = [[48, 10], [65, 26], [97, 26]], total = 62;
	for (var i = 0; i < len; i++) {
		var random = parseInt(Math.random() * total);
		for (var n = 0; n < ranges.length; n++) {
			if (random < ranges[n][1]) {
				a[i] = String.fromCharCode(ranges[n][0] + random);
				break;
			}
			random -= ranges[n][1];
		}
	}

	return a.join('');
}


app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
});
