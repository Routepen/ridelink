module.exports = function(app, Route, User, mail) {

	app.post('/route/addrider', function(req, res) {
		console.log('adding rider');
		if (!req.user) {
			return res.end('please log in ');
		}

		Route.findById(req.body.routeId).populate('driver').exec(function(err, route) {
			if (req.user._id.toString() == route.driver._id.toString()) {
				return;
			}

			// var rider; temp remove
			var riderFound = false, confirmedRider = false;
			for (let i = 0; i < route.riders.length; i++) {
				if (route.riders[i].toString() == req.user._id) {
					riderFound = true;
					// rider = route.riders[i];
					break;
				}
			}
			for (let i = 0; i < route.confirmedRiders.length; i++) {
				if (route.confirmedRiders[i].toString() == req.user._id) {
					confirmedRider = true;
					riderFound = true;
					break;
				}
			}

			var userId = req.user._id;
			if (confirmedRider) {
				console.log('already confirmed');
				return res.redirect('/route?id=' + (route.shortId || route._id) + '&error=1');
			}

			if (!riderFound) {
				route.riders.push(userId);
			}
			var dropOffs = route.dropOffs || {};
			var pickUps = route.pickUps || {};
			dropOffs[req.user._id] = req.body.dropOffAddress;
			pickUps[req.user._id] = req.body.pickUpAddress;
			route.dropOffs = dropOffs;
			route.pickUps = pickUps;

			var onWaitlist = route.confirmedRiders.length == route.seats;
			route.riderStatus = route.riderStatus || {};
			route.riderStatus[userId] = {
				paid: false,
				onWaitlist: onWaitlist,
				baggage: req.body.baggage
			};
			route.markModified('dropOffs');
			route.markModified('pickUps');
			route.markModified('riderStatus');

			if (!riderFound) { // rider added
				req.user.routes = req.user.routes || [];
				req.user.routes.push(route);

				if (onWaitlist) {
					mail.sendMail({
						route: route,
						recipient: req.user,
						notifyRider: {
							onWaitlist: true
						}
					});
				}
				else {
					User.findById(userId, function(err, riderUser) {
						console.log('rider', riderUser);
						mail.sendMail({
							recipient: route.driver,
							route: route,
							rider: riderUser,
							notifyDriver: {
								riderAdded: true
							}
						});
					});

					mail.sendMail({
						recipient: req.user,
						route: route,
						notifyRider: {
							signedUp: true
						}
					});
				}
			}
			else {// info edited

			}

			route.save(function(err) {
				if (err) { console.log(err); return res.end(err.toString()); }
				req.user.save(function(err) {
					if (err) { console.log(err); return res.end(err.toString()); }
					res.json({});
				});
			});

		});
	});

};
