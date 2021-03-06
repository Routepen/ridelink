const Promise = require('bluebird');
const _ = require('lodash');

module.exports = function(app, Route, User, mail, gmAPI, geocode) {
	app.post('/route/update', function(req, res) {
		if (!req.user) {
			// TODO Allow user to be informed their session has timed out
			return res.redirect('/youveBeenLoggedOut');
		}


		Route.findById(req.body.routeId).populate('driver').exec(function(err, route) {
			if (route.driver._id.toString() != req.user._id.toString()) {
				console.log('hacker', route.driver._id, req.user._id);
				return res.json({
					status: 'failure',
					message: 'Nice try hacker'
				});
			}

			var updating = req.body.updating;
			var allowedKeys = ['origin', 'destination', 'seats', 'date', 'time', 'stops[]'];

			if (!_.includes(allowedKeys, updating)) {
				console.log('key not allowed');
				return res.json({
					status: 'failure',
					message: 'You specified an unsupported field'
				});
			}

			var allRiders = [];
			for (let i = 0; i < route.riders.length; i++) { allRiders.push(route.riders[i]); }
			for (let i = 0; i < route.confirmedRiders.length; i++) { allRiders.push(route.confirmedRiders[i]); }
			User.find({ _id: {$in:allRiders}}, function(err, riders) {
				riders.forEach(function(rider) {
					mail.sendMail({
						recipient: rider,
						route: route,
						changed: updating,
						notifyRider: {
							infoChanged: true
						}
					});
				});
			});


			if (updating == 'stops[]' && !req.body[updating]) { req.body['stops[]'] = []; }

			let updateCoords; // a promise to update coordinates

			if (req.body[updating] && req.body[updating] !== '') {
				var updating2 = updating;
				if (updating == 'stops[]') {
					updateCoords = new Promise((resolve, reject) => {
						let promises = [];
						let stops = req.body['stops[]'];
						if (typeof(stops) == 'string') { stops = [stops]; }

						for (let i = 0; i < stops.length; i++) {
							promises.push(geocode(stops[i], gmAPI));
						}
						Promise.all(promises).then(data => {
							route.stopsCoor = data;
							resolve();
						})
							.catch((err) => {
								reject(err);
							});
					});

					updating2 = 'stops';
				}
				route[updating2] = req.body[updating];

				if(updating == 'seats' && isNaN(req.body[updating])){
					console.log('seats provided was not a number.', 'Data updated was', req.body[updating]);
					return res.json({
						status: 'failure',
						message: 'Please input a number'
					});
				}

				if (updating == 'origin' || updating == 'destination') {
					updateCoords = new Promise((resolve, reject) => {
						geocode(req.body[updating], gmAPI)
							.then(data => {
								route[updating + 'Coor'] = data;
								resolve();
							})
							.catch((err) => {
								reject(err);
							});
					});
				}
				else {
					updateCoords = Promise.resolve(); // do nothing unless coords need updating
				}

				console.log('got distance', req.body.distance);
				route.distance = parseFloat(req.body.distance);



				updateCoords.then( () => {
					route.save(err => {
						if (err) { console.log(err);
							return res.json(
								{
									status: 'failure',
									message: 'Failed to update'
								});
						}
						res.json(
							{
								originCoor: route.originCoor,
								destinationCoor: route.destinationCoor,
								stopsCoor: route.stopsCoor
							}
						);
					});
				})
					.catch(e => {
						console.log(e);
					});
			}
			else {
				return res.json({
					status: 'failure',
					message: 'You can\'t enter an empty field'
				});
			}

		});
	});
};
