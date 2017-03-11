'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('fs');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const User = require('./models/User');
const Route = require('./models/Route');
const _ = require("lodash");
const app = express();

const auth = require("./auth");

mongoose.Promise = require('bluebird');
var conn = mongoose.createConnection('ds161169.mlab.com:61169/heroku_9170g7ps');
mongoose.connect('mongodb://victorcheng:victor97@ds161169.mlab.com:61169/heroku_9170g7ps',  {
  server: {
    socketOptions: {
      socketTimeoutMS: 0,
      connectTimeoutMS: 0
    }
  }
});
var db = mongoose.connection;

/*
const isAuthenticated = (req, res, next) =>
	if (req.isAuthenticated())
		return next();
	res.json({});
*/


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
app.use(cookieParser());

// parse application/json
app.use(bodyParser.json());

auth.setUpAuth(app);

app.get('/', function (req, res) {
	var data = {
		user: req.user,
		url: req.url
	};

	res.render('landing', data);
});

app.get('/route', function (req, res) {
	var handleRequest = function(err, route) {
		if (err || !route) {
			console.log(err);
			return res.end("404 couldn't find id " + req.query.id);
		}

		var isRider = false, confirmedRider = false, isDriver, opened;
		if (req.user) {
			route.riders.forEach(function(rider) {
				if (rider._id.toString() == req.user._id.toString()) {
					isRider = true;
				}
			});

			route.confirmedRiders.forEach(function(rider) {
				if (rider._id.toString() == req.user._id.toString()) {
					isRider = true;
					confirmedRider = true;
				}
			});
		}

		isDriver = req.user != undefined && route.driver._id.toString() == req.user._id.toString();

		var opened = route.opened == true;
		if (isDriver && !opened) {
			route.opened = true;
			route.save(function(err) {
				if (err) console.log(err);
			});
		}

		var data = {
			routeId: req.query.id,
			user: req.user,
			routeData: route,
			routeDataString: JSON.stringify(route, null, 4),
			url: req.url,
			isDriver: isDriver,
			isRider: isRider,
			confirmedRider: confirmedRider,
			opened: opened
		};

		res.render('route', data);
	}

	var id = req.query.id;
	if (id.length != 24) {
		Route.findOne({'shortId': id}).populate('driver').populate('riders').populate('confirmedRiders').exec(handleRequest);
	}
	else {
		Route.findById(id).populate('driver').populate('riders').populate('confirmedRiders').exec(handleRequest);
	}
});

app.get('/route/new', function (req, res) {
	if (!req.user) {
		return res.redirect("/auth/facebook?redirect=" + encodeURIComponent('/route/new'));
	}

	var data = {
		user: req.user,
		routeId: false,
		routeData: false,
		url: req.url
	};

	res.render('route', data);
});

app.get('/route/all', function (req, res) {
	Route.find({}, function(err, routes) {


    var ids = routes.map(function(r) {
      return r._id;
    });

    res.json(ids);
  });
});

app.post('/route/addrider', function(req, res) {
	if (!req.user) {
		return res.end("please log in ");
	}

	Route.findById(req.body.routeId, function(err, route) {
		console.log(route);

		var rider = false, confirmedRider = false;
		for (var i = 0; i < route.riders.length; i++) {
			if (route.riders[i].toString() == req.user._id) {
				rider = true;
				break;
			}
		}
		for (var i = 0; i < route.confirmedRiders.length; i++) {
			if (route.confirmedRiders[i].toString() == req.user._id) {
				confirmedRider = true;
				rider = true;
				break;
			}
		}

		var userId = req.user._id;
		if (confirmedRider) {
			return res.redirect("/route?id=" + (route.shortId || rotue._id) + "&error=1");
		}
		if (!rider) {
			route.riders.push(userId);
		}
		var dropOffs = route.dropOffs || {};
		dropOffs[req.user._id] = req.body.address;
		route.dropOffs = dropOffs;

		route.riderStatus = route.riderStatus || {};
		route.riderStatus[userId] = route.riderStatus[userId] || {
			paid: false
		};
		route.markModified('dropOffs');
		route.markModified('riderStatus');

		route.save(function(err) {
			if (err) { console.log(err); return res.end(err.toString()); }

			res.end("");
		})
	});
});

app.post('/route/confirmrider', function(req, res) {
	if (!req.user) {
		return res.end("please log in ");
	}

	Route.findById(req.body.routeId).populate('driver').populate('riders').populate('confirmedRiders').exec(function(err, route) {
		if (err) {
			return res.end(err.toString());
		}
		if (route.driver._id.toString() != req.user._id.toString()) {
			return res.end("nice try hacker");
		}

		for (var i = 0; i < route.riders.length; i++) {
			if (route.riders[i].id == req.body.userId) {
				route.riders.splice(i, 1);
				break;
			}
		}

		var found = false;
		for (var i = 0; i < route.confirmedRiders.length; i++) {
			if (route.confirmedRiders[i].id == req.body.userId) {
				found = true;
				break;
			}
		}

		if (!found) route.confirmedRiders.push(req.body.userId);

		route.save(function(err) {
			if (err) { return res.end(err.toString()); }

			res.redirect("/route?id=" + (route.shortId || route._id));
		})
	});
});

app.post('/route/new', function (req, res) {
	if (!req.user) {
		// TODO Allow user to be informed their session has timed out
		return res.redirect("/youveBeenLoggedOut");
	}

	var rightNow = new Date(Date.now());
	var date = new Date(req.body.date);

	if (date.getMonth() < rightNow.getMonth()) {
		date.setYear(rightNow.getYear() + 1901);
	}
	else {
		date.setYear(rightNow.getYear() + 1900);
	}

	var newRoute = Route({
		shortId: random(5),
		origin: req.body.origin,
		destination: req.body.destination,
		seats: req.body.seats,
		date: date,
		time: req.body.time,
		driver: req.user._id,
		riders:[],
		riderStatus: {},
		confirmedRiders: [],
		dropOffs: {},
		inconvenience: req.body.charge,
		requireInitialDeposit: req.body.requireInitialDeposit == "on"
	});

	if (req.body.confirmedEmail) {
		req.user.confirmedEmail = req.body.confirmedEmail;
		req.user.save(function(err) {
			if (err) console.log(errr);
		});
	}

	newRoute.save(function(err){
		if(err) throw err;
		console.log("Route created!");
		return res.redirect("/route?id=" + (newRoute.shortId || newRoute._id));
	});
});

app.get('/testing2', function(req, res) {
	var newUser = new User({
    "confirmedEmail": "pmh192@gmail.com",
    "facebook": {
        "gender": "male",
        "photos": "[object Object]",
        "email": "",
        "name": "TestUser1 McGee",
        "token": "EAAP9KxoqCucBAN8ZAnRNvZByb0C5sYFjZAwCIRBWElaMrBTpKja18bkNeJK3kU2ZC3upoADET2hb9y9E890vIklIrZBKVvO42sqhP7oO7MjWewvC7qWsf2b0PX6sDGxRnbpxTysHKwOnfCGAuflzpSo4aBY7W25TRZAHBCPJQvhgZDZD",
        "id": "1275391965875712"
    }
	});

	newUser.save(function(err) {
		if (err) console.log(err);
		res.end("");
	});
});

app.get('/test3', function(req, res) {
	User.findById('58bf31629ab19796361b80d7', function(err, user) {
		req.logIn(user, function(err) {
      if (err) { console.log(err); }
      return res.redirect('/');
    });
	});
});

app.get('/profile', function(req, res){
	res.render('profile');
});

app.post('/route/update', function(req, res) {
	console.log('updating');
	if (!req.user) {
		// TODO Allow user to be informed their session has timed out
		return res.redirect("/youveBeenLoggedOut");
	}


	Route.findById(req.body.routeId).populate('driver').exec(function(err, route) {
		if (route.driver._id.toString() != req.user._id.toString()) {
			console.log('hacker', route.driver._id, req.user._id);
			return res.end("nice try hacker");
		}

		var updating = req.body.updating;
		var allowedKeys = ["origin", "destination", "seats", "date", "time"];

		if (_.includes(allowedKeys, updating)) {
			route[updating] = req.body[updating];
		}

		route.save(function(err) {
			if (err) { console.log(err); }
			res.end();
		})
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
