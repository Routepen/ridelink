module.exports = function(app, Route) {
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

      var userId = '';
      if (req.user) {
        userId = req.user._id;
      }

  		var data = {
  			routeId: route._id,
  			user: req.user,
        		userId: userId,
  			routeData: route,
  			routeDataString: JSON.stringify(route, null, 4),
  			url: req.url,
  			isDriver: isDriver,
  			isRider: isRider,
  			confirmedRider: confirmedRider,
  			opened: opened,
        view: req.query.view || "",
        action: req.query.action || "",
        riderId: req.query.riderId || "",
        paymentConfirmed: req.query.status == "paymentConfirmed"
  		};

  		res.render('route_old', data);
  	}

  	var id = req.query.id;
  	if (id.length != 24) {
  		Route.findOne({'shortId': id}).populate('driver').populate('riders').populate('confirmedRiders').exec(handleRequest);
  	}
  	else {
  		Route.findById(id).populate('driver').populate('riders').populate('confirmedRiders').exec(handleRequest);
  	}
  });
};
