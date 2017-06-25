module.exports = function(app, Route, User) {
	app.post('/route/cancelrequest', function(req, res) {
		if (!req.user) {
			return res.end('please log in ');
		}

		var removingId = req.user._id;

		Route.findById(req.body.routeId, function(err, route) {

			var removed = false;
			for (var i = 0; i < route.riders.length; i++) {
				var rider = route.riders[i];
				if (rider.toString() == removingId) {
					removed = true;
					route.riders.splice(i, 1);
					break;
				}
			}

			if (!removed) {
				return res.redirect('/route?id=' + (route.shortId || route._id) + '&error=2');
			}
			/*
      var dropOffs = route.dropOffs || {};
      delete dropOffs[req.user._id];
      route.dropOffs = dropOffs;
      */
			delete route.dropOffs[req.user._id];
			delete route.pickUps[req.user._id];

			/*
      var temppickUps = route.pickUps || {};
      delete temppickUps[req.user._id];
      route.pickUps = temppickUps;
*/
			route.riderStatus = route.riderStatus || {};
			if (route.riderStatus[removingId]) {
				delete route.riderStatus[removingId];
			}
			route.markModified('dropOffs');
			route.markModified('pickUps');
			route.markModified('riderStatus');

			route.save(function(err) {
				if (err) { console.log(err); return res.end(err.toString()); }
				res.end('success');
			});
		});


		User.findById(removingId, function(err, riderUser) {
			var index = -1;
			for(var i = 0; i < riderUser.routes.length; i++){
				if(riderUser.routes[i] == req.body.routeId){
					index = i;
				}
			}
			if(index != -1){
				riderUser.routes.splice(index, 1);
			}

			riderUser.markModified('routes');

			riderUser.save(function(err){
				if (err) { console.log(err); return res.end(err.toString()); }
				res.end('deleted user\'s route entry');
			});
		});

	});
};
