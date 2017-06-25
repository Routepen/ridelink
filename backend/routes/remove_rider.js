module.exports = function(app, Route, User) {

	app.post('/route/removerider', function(req, res) {
		if (!req.user) {
			return res.end('please log in ');
		}

		var removingId = req.body.userId;

		Route.findById(req.body.routeId, function(err, route) {
			//&& !(route.confirmedRiders.indexOf(req.user._id.toString()) > -1)
			if ((req.user._id.toString() != route.driver.toString()) ) {
				console.log('hacking');
				return res.end('failure');
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
				return res.redirect('/route?id=' + (route.shortId || route._id) + '&error=2');
			}
			delete route.dropOffs[req.user._id];
			delete route.pickUps[req.user._id];

			route.riderStatus = route.riderStatus || {};
			route.riderStatus[removingId] = route.riderStatus[removingId] || {
				paid: false
			};
			route.markModified('dropOffs');
			route.markModified('pickUps');
			route.markModified('riderStatus');

			route.save(function(err) {
				if (err) { console.log(err); return res.end(err.toString()); }

				res.end('success');
			});
		});
		console.log(User);
		/*
    User.findById(removingId, function(err, riderUser) {
        var index = -1;
        for(var i = 0; i < riderUser.routes.length; i++){
            if(riderUser.routes[i] == req.body.routeId){
                index = i;
            }
        }
        if(index != -1){
            var tempriderUser = riderUser.routes || {};
            var one = tempriderUser.splice(0,index);
            var two = tempriderUser.splice(index+1, tempriderUser.length);
            riderUser.routes = one.concat(two);
         }

        riderUser.save(function(err){
          if (err) { console.log(err); return res.end(err.toString()); }
          res.end("deleted user's route entry");
        });

    });
    */

	});
};
