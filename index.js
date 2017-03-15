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
const EmailSubscribe = require('./models/EmailSubscribe')
const _ = require("lodash");
const app = express();

const auth = require("./auth");
const mail = require("./mail");
const payment = require("./payments");

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
payment.setUp(app, Route);

app.get('/', function (req, res) {
	var data = {
		user: req.user,
		url: req.url
	};

	res.render('new_landing', data);
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
			routeId: route._id,
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
	console.log("adding rider");
	if (!req.user) {
		return res.end("please log in ");
	}

	Route.findById(req.body.routeId).populate('driver').exec(function(err, route) {

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
			console.log("already confirmed");
			return res.redirect("/route?id=" + (route.shortId || rotue._id) + "&error=1");
		}
		if (!rider) {
			route.riders.push(userId);
		}
		var dropOffs = route.dropOffs || {};
		dropOffs[req.user._id] = req.body.address;
		route.dropOffs = dropOffs;

		route.riderStatus = route.riderStatus || {};
		route.riderStatus[userId] = {
			paid: false
		};
		route.markModified('dropOffs');
		route.markModified('riderStatus');

		mail.sendMail({
			to: route.driver.facebook.email,
			driver: route.driver,
			options: {
				notifyDriver: {
					riderAdded: true
				}
			}
		});

		mail.sendMail({
			to: route.driver.facebook.email,
			driver: route.driver,
			options: {
				notifyRider: {
					signedUp: true
				}
			}
		});

		req.user.routes = req.user.routes || [];
		req.user.routes.push(route);

		route.save(function(err) {
			if (err) { console.log(err); return res.end(err.toString()); }
			req.user.save(function(err) {
				if (err) { console.log(err); return res.end(err.toString()); }
				res.end("");
			});
		});

	});
});

app.post('/route/removerider', function(req, res) {
	if (!req.user) {
		return res.end("please log in ");
	}


	var removingId = req.body.userId;

	Route.findById(req.body.routeId, function(err, route) {

		if (req.user._id.toString() != route.driver.toString()) {
			console.log("hacking");
			return res.end("failure");
		}

		var removed = false;
		for (var i = 0; i < route.confirmedRiders.length; i++) {
			var rider = route.confirmedRiders[i];
			if (rider.toString() == removingId) {
				removed = true;
				route.riders.push(rider);
				route.confirmedRiders.splice(i, 1);
				break;
			}
		}

		if (!removed) {
			return res.redirect("/route?id=" + (route.shortId || rotue._id) + "&error=2");
		}
		var dropOffs = route.dropOffs || {};
		delete dropOffs[req.user._id]
		route.dropOffs = dropOffs;

		route.riderStatus = route.riderStatus || {};
		route.riderStatus[removingId] = route.riderStatus[removingId] || {
			paid: false
		};
		route.markModified('dropOffs');
		route.markModified('riderStatus');

		route.save(function(err) {
			if (err) { console.log(err); return res.end(err.toString()); }

			res.end("success");
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

		if (!found) {
			route.confirmedRiders.push(req.body.userId);
			route.riderStatus[req.body.userId].confirmedOn = new Date(Date.now());
			route.markModified('riderStatus');
		}

		mail.sendMail({
			to: route.driver.facebook.email,
			driver: route.driver,
			options: {
				notifyRider: {
					confirmed: true
				}
			}
		});

		route.save(function(err) {
			if (err) { return res.end(err.toString()); }

			res.redirect("/route?id=" + (route.shortId || route._id));
		});
	});
});

app.post('/route/riderpaid', function(req, res) {
	if (!req.user) {
		// TODO Allow user to be informed their session has timed out
		return res.redirect("/youveBeenLoggedOut");
	}

	console.log(req.body.routeId);
	Route.findById(req.body.routeId, function(err, route) {
		if (!route) { return res.end("404"); }

		route.riderStatus = route.riderStatus || {};
		route.riderStatus[req.user._id] = route.riderStatus[req.user._id] || {}
		route.riderStatus[req.user._id].paid = true;
		route.markModified('riderStatus');

		mail.sendMail({
			to: route.driver.facebook.email,
			driver: route.driver,
			options: {
				notifyDriver: {
					riderPaid: true
				}
			}
		});

		route.save(function (error) {
			if (error) { console.log(error); return res.end(error.toString()); }
			res.end("success");
		});
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
	}
	req.user.routes.push(newRoute);
	req.user.save(function(err) {
		if (err) console.log(err);
	});

	newRoute.save(function(err){
		if(err) throw err;
		console.log("Route created!");
		mail.sendMail({
			notifyDriver: {
				routeCreated: true
			},
			to: req.user.confirmedEmail
		});
		return res.redirect("/route?id=" + (newRoute.shortId || newRoute._id));
	});
});

app.get('/sendMail', function(req, res) {
  var n = req.query.n;
  if (n == "1") {
    mail.sendMail({
      notifyDriver: {
        routeCreated: true
      },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n == "2") {
    mail.sendMail({
      notifyRider: {
        signedUp: true
      },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n == "3") {
    mail.sendMail({
      notifyRider: {
        confirmed: true
      },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="4") {
    mail.sendMail({
      notifyRider: {
        offWaitlist: true
      },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="5") {
    mail.sendMail({
      notifyRider: {
        infoChanged: true
      },
      driver: {facebook:{name: "Porter Haet"} },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="6") {
    mail.sendMail({
      notifyRider: {
        offWaitlist: true
      },
      driver: {facebook:{name: "Porter Haet"} },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="7") {
    mail.sendMail({
      notifyRider: {
        paid: true
      },
      driver: {facebook:{name: "Porter Haet"} },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="8") {
    mail.sendMail({
      notifyRider: {
        shouldBePickedUp: true
      },
      driver: {facebook:{name: "Porter Haet"} },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="9") {
    mail.sendMail({
      notifyRider: {
        joinedFeatureWaitlist: true
      },
      driver: {facebook:{name: "Porter Haet"} },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="10") {
    mail.sendMail({
      notifyDriver: {
        riderAdded: true
      },
      driver: {facebook:{name: "Porter Haet"} },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="11") {
    mail.sendMail({
      notifyDriver: {
        riderPaid: true
      },
      driver: {facebook:{name: "Porter Haet"} },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="12") {
    mail.sendMail({
      notifyDriver: {
        shouldBePickingUp: true
      },
      driver: {facebook:{name: "Porter Haet"} },
      to: 'pmh192@gmail.com'
    });
  }
  res.end("");
});

app.get('/testing2', function(req, res) {
	var newUser = new User({
    "facebook": {
        "link": "https://www.facebook.com/app_scoped_user_id/1275391965875712/",
        "gender": "male",
        "email": "",
        "name": "Porter Haet",
        "token": "EAAP9KxoqCucBAMF22hAWQD5cNryPVRSAsAVy0qIGgMMKH8AkIMiucu8HbJJHYTa1ZBjFnfGiVv1wnIqcjZAMHmIUuSEHJtsZAdeCmyDHwvZAxQOrJpMrOFh9fvZAxxqHFcZAzMlWHVWCPh9MBFSYGFNLGMEO5xzzqo0aa3TyRhOwZDZD",
        "id": "1275391965875713",
        "photos": [
            {
                "value": "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/12729183_959477910800454_5056109822890601521_n.jpg?oh=ce58e8e7a372cbc9e18bab4f24409c4d&oe=59661BB4"
            }
        ]
    },
    "confirmedEmail": "pmh192@gmail.com"
	});

	newUser.save(function(err) {
		if (err) console.log(err);
		res.end("saved" + JSON.stringify(newUser));
	});
});

app.get('/test3', function(req, res) {
	User.findById('58c8ec46ceda60e82de5f850', function(err, user) {
		console.log(user);
		req.logIn(user, function(err) {
      if (err) { console.log(err); }
      return res.redirect('/');
    });
	});
});


app.get('/profile', function(req, res){
	res.render('profile');
});

app.get('/route/mine', function(req, res){
	if (!req.user) {
		return res.redirect("/auth/facebook?redirect=" + encodeURIComponent('/route/mine'));
	}

	console.log(req.user.routes);
	Route.find({ _id: {$in:req.user.routes}}, function(err, routes) {
		var data = {
			user: req.user || false,
			url: req.url,
			routes: routes
		};

		res.render('userRoutes', data);
	});
});

app.get('/test4', function(req, res) {
	console.log(mail);
	mail.sendMail({
		notifyDriver: {
			riderAdded: true
		},
		to: 'pmh192@gmail.com'
	});
	res.end();
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

app.post('/emailsubscribe', function(req,res){
	console.log(req.body);
	var subscriber = EmailSubscribe({
		email: req.body.email
	});

	subscriber.save(function(err){
		if(err) throw err;
		return res.redirect("/");
	});
});


app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
});
