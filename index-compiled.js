'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const fs = require('fs');
const mongoose = require('mongoose');
const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const app = express();
const User = require('./models/User');
const Route = require('./models/Route');

mongoose.Promise = require('bluebird');
var conn = mongoose.createConnection('ds161169.mlab.com:61169/heroku_9170g7ps');
mongoose.connect('mongodb://victorcheng:victor97@ds161169.mlab.com:61169/heroku_9170g7ps');
var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
	console.log("we're connected!");
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

app.get('/auth/facebook', function (req, res) {
	passport.use(new FacebookStrategy({
		clientID: "1122786494515943",
		clientSecret: "f6cd89a5fe00867021469477156f95a6",
		callbackURL: "http://localhost:3000/auth/facebook/callback",
		profileFields: ['id', 'first_name', 'last_name', 'photos', 'email', 'gender', 'link', 'token_for_business']
	}, function (accessToken, refreshToken, profile, cb) {
		User.findOrCreate({ facebookId: profile.id }, function (err, user) {
			if (err) return done(err);
			if (user) {
				return done(null, user);
			} else {
				var newUser = new User();
				newUser.facebook.id = profile.id;
				newUser.facebook.token = token;
				newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
				newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();
				newUser.facebook.photos = profile.picture;
				newUser.facebook.gender = profile.gender;
				newUser.facebook.link = profile.link;

				newUser.save(function (err) {
					if (err) throw err;
					return done(null, newUser);
				});
			}
			return cb(err, user);
		});
	}));
	passport.authenticate('facebook', { authType: 'rerequest', scope: ["public_profile,email"] });
});
app.get('/auth/facebook/callback', function (req, res) {
	passport.authenticate('facebook', { failureRedirect: '/login' }), function (req, res) {
		// Successful authentication, redirect home.
		res.redirect('/');
	};
});
app.get('/logout', function (req, res) {});
app.get('/addroute/', function (req, res) {});

app.post('/route/', function (req, res) {
	var newRoute = Route({
		origin: req.body.origin,
		destination: req.body.destination,
		driver: "58b25a4e4837cb41284df95d",
		riders: ["58b25a4e4837cb41284df95d"]
	});

	newRoute.save(function (err) {
		if (err) throw err;
		console.log("Route created!");
	});
	res.sendStatus(200);
	//send res.object_id 
});

app.listen(app.get('port'), function () {
	console.log('running on port', app.get('port'));
});

//# sourceMappingURL=index-compiled.js.map