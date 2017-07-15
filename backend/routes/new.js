const Promise = require('bluebird');
const NotificationManager = require('../notifications/notification_manager');
const _ = require("lodash");

module.exports = function(app, Route, DriverlessRoute, User, mail, gmAPI, geocode) {

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

	function validatePostBody(body) {
		if (!_.get(body, "routeData.origin.place_id")) { throw new Error("missing routeData.origin.place_id"); }
		if (!_.get(body, "routeData.destination.place_id")) { throw new Error("missing routeData.destination.place_id"); }

		if (!_.get(body, "routeData.origin.name")) { throw new Error("missing routeData.origin.name"); }
		if (!_.get(body, "routeData.destination.name")) { throw new Error("missing routeData.destination.name"); }

		let stops = body.stops || [];
		if (!Array.isArray(stops)) { stops = [stops]; }

		stops.forEach(function(stop) {
			if (!_.get(stop, "lat")) { throw new Error("missing place_id in a stop element"); }
			if (!_.get(stop, "lng")) { throw new Error("missing lng in a stop element"); }
		});

		body.stops = stops;
	}

	app.post('/route/new', function (req, res) {
		if (!req.user) {
			// TODO Allow user to be informed their session has timed out
			return res.status(401).send('You need to be logged in.');
		}

		console.log(req.body);

		try {
			validatePostBody(req.body)
		} catch (e) {
			console.log("400 Bad request");
			console.log(e);
			return res.status(400).end("Invalid post body " + e.message);
		}

		var rightNow = new Date(Date.now());
		var date = new Date(req.body.date);

		if (date.getMonth() < rightNow.getMonth()) {
			date.setYear(rightNow.getYear() + 1901);
		}
		else {
			date.setYear(rightNow.getYear() + 1900);
		}

		// var originCoor, destinationCoor;

		console.log(req.body);

		var driver, driverInfo; // should only store one
		if (req.body.driverInfo) {
			driverInfo = req.body.driverInfo;
			driver = undefined;
		}
		else {
			driver = req.user._id;
			driverInfo = undefined;
		}

		promises = [
			geocode(req.body.routeData.origin, gmAPI),
			geocode(req.body.routeData.destination, gmAPI)
		];

		Promise.all(promises).then(function(data) {
			var newRoute;
			var routeData = {
				shortId: random(5),
				origin: req.body.routeData.origin,
				destination: req.body.routeData.destination,
				originCoor: data[0],
				destinationCoor: data[1],
				seats: req.body.seats,
				date: date,
				time: req.body.time,
				driver: driver,
				driverInfo: driverInfo,
				riders:[],
				riderStatus: {},
				confirmedRiders: [],
				dropOffs: {},
				inconvenience: req.body.charge,
				requireInitialDeposit: false,//req.body.requireInitialDeposit,
				isWaitlisted: false,
				stops: req.body.stops,
				distance: req.body.distance
			};


			try {
				if (routeData.driverInfo) {
					newRoute = DriverlessRoute(routeData);
				}
				else {
					newRoute = Route(routeData);
				}
			}
			catch(e) {
				console.log(e);
				return res.status(400).end(e.message);
			}

			if (req.body.confirmedEmail) {
				req.user.confirmedEmail = req.body.confirmedEmail;
			}
			req.user.routes.push(newRoute);
			req.user.save(function(err) {
				if (err) console.log(err);
			});

			newRoute.save(function(err){
				if(err) throw err;
				console.log('Route created!');

				var redirectTo = '/route?id=' + (newRoute.shortId || newRoute._id);
				if (!driver) {
					return res.end(redirectTo);
				}

				User.findById(newRoute.driver, function(err, driver) {
					newRoute.driver = driver;

					NotificationManager.onRouteCreated(newRoute);

					if(driver.confirmedEmail != ''){
						mail.sendMail({
							notifyDriver: {
								routeCreated: true
							},
							recipient: driver,
							route: newRoute
						});
						console.log('Sending mail to', driver.confirmedEmail);
					} else {
						console.log('Did not send email');
					}
					return res.end(redirectTo);
				});
			});
		});
	});

	app.get('/route/new', function (req, res) {
		if (!req.user) {
			return res.redirect('/auth/facebook?redirect=' + encodeURIComponent('/route/new'));
		}

		var data = {
			data: {
				user: req.user,
				routeId: false,
				routeData: false,
				url: req.url,
				creatingRoute: true,
				isDriver: false,
				view: '',
				action: ''
			}
		};

		res.render('new_route', data);
	});

	app.get('/route/newDriverLess', function (req, res) {
		res.render('new_route_driverless');
	});

};
