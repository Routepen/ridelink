module.exports = function(app, NotificationRequests, User, gmAPI, geocode) {
	app.post('/route/requestnotifications', function(req, res) {
		console.log('Notification requested');
		if (!req.user) {
			return res.status(300).end('not logged in');
		}
		//Change the confirmed email to this new email
		var queryEmail = {
			'_id': req.user._id
		};
		if(req.body.confirmedEmail != req.user.confirmedEmail){
			User.findOne(queryEmail, function(err, doc){
				doc.confirmedEmail = req.body.confirmedEmail;
				doc.save();
			});
		}

		User.findOne({_id: req.user._id}).populate('requests').exec(function(err, user) {
			if (err) { console.log(err); return res.status(500).end(''); }

			if (!user.requests) {
				user.requests = [];
			}

			if (user.requests.length >= 5) {
				return res.end('too many requests');
			}

			for (var i = 0; i < user.requests.length; i++) {
				if (req.body.origin == user.requests[i].origin &&
												req.body.destination == user.requests[i].destination) {
					return res.end('notifications request already exists');
				}
			}

			var body = req.body;
			console.log(JSON.stringify(body));
			if (!body.origin || !body.destination || !body['dateRange[]']
										|| body['dateRange[]'].length != 2) {
				return res.end('failure');
			}

			var getOrigin = geocode(req.body.origin, gmAPI);
			var getDestination = geocode(req.body.destination, gmAPI);
			var promises = [getOrigin, getDestination];

			Promise.all(promises).then(function(data) {

				var dateRange = [
					new Date(req.body['dateRange[]'][0]),
					new Date(req.body['dateRange[]'][1])
				];

				var notificationRequest = new NotificationRequests({
					origin: req.body.origin,
					destination: req.body.destination,
					originCoor: data[0],
					destinationCoor: data[1],
					dateRangeStart: dateRange[0],
					dateRangeEnd: dateRange[1],
					user: req.user
				});

				notificationRequest.save(function(err) {
					if (err) { console.log(err); return res.status(500).end(''); }

					user.requests.push(notificationRequest);
					user.save(function(err) {
						if (err) { console.log(err); return res.status(500).end(''); }

						res.end('success');
					});
				});
			})
				.catch(function(err) {
					console.log(err);
					res.end('failure');
				});


		});
	});
};
