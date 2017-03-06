'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('fs');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./models/User');
const Route = require('./models/Route');
const _ = require("lodash");
const app = express();

mongoose.Promise = require('bluebird');
var conn = mongoose.createConnection('ds161169.mlab.com:61169/heroku_9170g7ps');
mongoose.connect('mongodb://victorcheng:victor97@ds161169.mlab.com:61169/heroku_9170g7ps');
var db = mongoose.connection;

/*
const isAuthenticated = (req, res, next) =>
	if (req.isAuthenticated())
		return next();
	res.json({});
*/

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log("we're connected!");
});

app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse cookie sessions
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: "Thisshouldbemademoresecure"
}));
app.use(cookieParser());

// parse application/json
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
	done(null, user._id);
});

passport.deserializeUser(function (id, done) {
	User.findById(id, function (err, user) {
		done(err, user);
	});
});

passport.use(new FacebookStrategy({
	clientID: "1122786494515943",
	clientSecret: "f6cd89a5fe00867021469477156f95a6",
	callbackURL: "http://localhost:5000/auth/facebook/callback",
	profileFields: ['id', 'first_name', 'last_name', 'photos', 'email', 'gender', 'link']
}, function (accessToken, refreshToken, profile, done) {
	console.log(profile);
	process.nextTick(function () {
		User.findOne({ 'facebook.id': profile.id }, function (err, user) {
			if (err) return done(err);else if (user) {
				return done(null, user);
			} else {
				var newUser = new User();
				newUser.facebook.id = profile.id;
				newUser.facebook.token = accessToken;
				newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
				newUser.facebook.email = _.get(profile, 'emails[0].value', '').toLowerCase();
				newUser.facebook.photos = profile.picture;
				newUser.facebook.gender = profile.gender;
				newUser.facebook.link = profile.link;

				newUser.save(function (err) {
					if (err) throw err;
					return done(null, newUser);
				});
			}
			return;
		});
	});
}));

app.get('/', function (req, res) {
	var data = {
		user: req.user,
		url: req.url
	};

	res.render('landing', data);
});

app.get('/route', function (req, res) {
	Route.findById(req.query.id).populate('driver').populate('riders').exec(function (err, route) {
		if (err || !route) {
			console.log(err);
			return res.end("404 couldn't find id " + req.query.id);
		}

		var data = {
			routeId: req.query.id,
			user: req.user,
			routeData: route,
			url: req.url
		};

		console.log(JSON.stringify(route, null, 4));

		res.render('route', data);
	});
});

app.get('/route/new', function (req, res) {
	if (!req.user) {
		return res.redirect("/auth/facebook");
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
	Route.find({}, function (err, routes) {

		var ids = routes.map(function (r) {
			return r._id;
		});

		res.json(ids);
	});
});

app.post('/route/addrider', function (req, res) {
	if (!req.user) {
		return res.end("please log in ");
	}

	Route.findById(req.body.routeId, function (err, route) {
		console.log(route);
		route.riders.push(req.user._id);
		route.dropOffs = route.dropOffs || {};
		route.dropOffs[req.user._id] = req.body.address;

		route.save(function (err) {
			if (err) {
				return res.end(err.toString());
			}

			res.redirect("/route?id=" + route._id);
		});
	});
});

app.post('/route/confirmrider', function (req, res) {
	if (!req.user) {
		return res.end("please log in ");
	}

	Route.findById(req.body.routeId).populate('driver').populate('riders').populate('confirmedRiders').exec(function (err, route) {
		if (err) {
			return res.end(err.toString());
		}
		if (route.driver._id.toString() != req.user._id.toString()) {
			return res.end("nice try hacker");
		}

		for (var i = 0; i < route.riders.length; i++) {
			console.log(route.riders[i].id, route.riders[i]._id);
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

		route.save(function (err) {
			if (err) {
				return res.end(err.toString());
			}

			res.redirect("/route?id=" + route._id);
		});
	});
});

app.post('/route/new', function (req, res) {
	if (!req.user) {
		// TODO Allow user to be informed their session has timed out
		return res.redirect("/youveBeenLoggedOut");
	}

	var newRoute = Route({
		origin: req.body.origin,
		destination: req.body.destination,
		seats: req.body.seats,
		date: new Date(req.body.date),
		driver: req.user._id,
		riders: [],
		confirmedRiders: [],
		dropOffs: {}
	});

	newRoute.save(function (err) {
		if (err) throw err;
		console.log("Route created!");
		return res.redirect("/route?id=" + newRoute._id);
	});
});

// For testing purposes only
app.get('/rider', function (req, res) {
	res.render('partials/driver_input');
});

app.get('/profile', function (req, res) {
	res.send("hello");
});

app.get('/auth/logout', function (req, res) {
	req.logout();
	res.redirect("/");
});

app.get('/auth/facebook', function (req, res, next) {
	console.log('/auth/facebook/callback?redirect=' + encodeURIComponent(req.query.redirect));
	passport.authenticate('facebook', { callbackURL: '/auth/facebook/callback?redirect=' + encodeURIComponent(req.query.redirect) }, { scope: ["public_profile,email"] })(req, res, next);
});

app.get('/auth/facebook/callback/', function (req, res, next) {
	console.log('/auth/facebook/callback?redirect=' + encodeURIComponent(req.query.redirect));
	passport.authenticate('facebook', {
		callbackURL: '/auth/facebook/callback?redirect=' + encodeURIComponent(req.query.redirect),
		successRedirect: req.query.redirect,
		failureRedirect: '/'
	})(req, res, next);
});
app.get('/logout', function (req, res) {});

app.get('/rider/', function (req, res) {});

app.listen(app.get('port'), function () {
	console.log('running on port', app.get('port'));
});

//# sourceMappingURL=index-compiled.js.map