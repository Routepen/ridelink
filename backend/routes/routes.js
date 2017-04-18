module.exports = function(app, Route, mail) {

  require("./add_rider")(app, Route, mail);

  require("./remove_rider")(app, Route, mail);

  require("./cancel_request")(app, Route);

  require("./confirm_rider")(app, Route);


  app.post('/route/riderpaid', function(req, res) {
  	if (!req.user) {
  		// TODO Allow user to be informed their session has timed out
  		return res.redirect("/youveBeenLoggedOut");
  	}

  	Route.findById(req.body.routeId, function(err, route) {
  		if (!route) { return res.end("404"); }

  		route.riderStatus = route.riderStatus || {};
  		route.riderStatus[req.user._id] = route.riderStatus[req.user._id] || {}
  		route.riderStatus[req.user._id].paid = true;
  		route.markModified('riderStatus');

  		mail.sendMail({
  			recipient: route.driver,
  			notifyDriver: {
  				riderPaid: true
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

    // var t = req.body.time;
    // if (t != "") {
    //   var parts = t.split(":");
    //   var s = parseInt(parts[0]);
    //   if (!isNaN(s)) {
    //     if (s == 0) {
    //       t =  "12:" + parts[1] + " AM";
    //     }
    //     else if (s < 12) { t += " AM"; }
    //     else if (s == 12) { t += " PM"; }
    //     else {
    //       if (parts.length > 1) {
    //           t = (s-12) + ":" + parts[1] + " PM";
    //       }
    //     }
    //   }
    //   req.body.time = t;
    // }

  	var originCoor, destinationCoor;
  	//TODO geocode the origin and distance (check to see if it's in the cache already), then enter it as total distance

    let getOrigin = geocode(req.body.origin, gmAPI);
    let getDestination = geocode(req.body.destination, gmAPI);
    let promises = [getOrigin, getDestination];

    let stops = req.body["stops[]"] || [];
    if (typeof(stops) == "string") { stops = [stops]; }

    console.log(stops);
    for (var i = 0; i < stops.length; i++) {
      console.log(stops[i]);
      promises.push(geocode(stops[i], gmAPI));
    }
    Promise.all(promises).then(data => {
      let originCoor = data[0];
      let destinationCoor = data[1];
      let stopsCoor = data.splice(2);

      var newRoute;
      try {
        newRoute = Route({
      		shortId: random(5),
      		origin: req.body.origin,
      		destination: req.body.destination,
    		  originCoor: originCoor,
    		  destinationCoor: destinationCoor,
      		seats: req.body.seats,
      		date: date,
      		time: req.body.time,
      		driver: req.user._id,
      		riders:[],
      		riderStatus: {},
      		confirmedRiders: [],
      		dropOffs: {},
      		inconvenience: req.body.charge,
      		requireInitialDeposit: false,//req.body.requireInitialDeposit,
          isWaitlisted: false,
          stops: req.body["stops[]"],
          stopsCoor: stopsCoor,
          distance: req.body.distance
      	});
      }
      catch(e) {
        res.status(400);
        return res.end();
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
    		console.log("Route created!");
        User.findById(newRoute.driver, function(err, driver) {
          newRoute.driver = driver;
          mail.sendMail({
      			notifyDriver: {
      				routeCreated: true
      			},
      			recipient: req.user,
            route: newRoute
      		});
          return res.end("/route?id=" + (newRoute.shortId || newRoute._id));
        });
    	});
    });
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
  		var allowedKeys = ["origin", "destination", "seats", "date", "time", "stops[]"];

  		if (!_.includes(allowedKeys, updating)) {
        console.log("key not allowed");
  			return res.end("failure");
  		}

      var allRiders = [];
      for (var i = 0; i < route.riders.length; i++) { allRiders.push(route.riders[i]); }
      for (var i = 0; i < route.confirmedRiders.length; i++) { allRiders.push(route.confirmedRiders[i]); }
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

      // if (updating == "time") {
      //   var t = req.body[updating];
      //   var parts = t.split(":");
      //   var s = parseInt(parts[0]);
      //   if (!isNaN(s)) {
      //     if (s == 0) {
      //       t =  "12:" + parts[1] + " AM";
      //     }
      //     else if (s < 12) { t += " AM"; }
      //     else if (s == 12) { t += " PM"; }
      //     else {
      //       if (parts.length > 1) {
      //           t = (s-12) + ":" + parts[1] + " PM";
      //       }
      //     }
      //   }
      //   req.body[updating] = t;
      // }


      if (updating == "stops[]" && !req.body[updating]) { req.body['stops[]'] = []; }

      let updateCoords; // a promise to update coordinates

      if (req.body[updating] && req.body[updating] !== "") {
        var updating2 = updating;
        if (updating == "stops[]") {
          updateCoords = new Promise((resolve, reject) => {
            let promises = [];
            let stops = req.body["stops[]"];
            if (typeof(stops) == "string") { stops = [stops]; }

            console.log("stops", stops);
            for (var i = 0; i < stops.length; i++) {
              promises.push(geocode(stops[i], gmAPI));
            }
            Promise.all(promises).then(data => {
              console.log(data);
              route.stopsCoor = data;
              resolve();
            });
          });

          updating2 = "stops";
        }
        route[updating2] = req.body[updating];

        if (updating == "origin" || updating == "destination") {
          updateCoords = new Promise((resolve, reject) => {
            geocode(req.body[updating], gmAPI).then(data => {
              route[updating + "Coor"] = data;
              resolve();
            });
          });
        }
        else {
          updateCoords = Promise.resolve(); // do nothing unless coords need updating
        }

        console.log("got distance", req.body.distance);
        route.distance = parseFloat(req.body.distance);

      }

      updateCoords.then( () => {
        console.log("1", route.stopsCoor);
        route.save(err => {
          console.log("2", route.stopsCoor);
          console.log(err);
          if (err) { console.log(err); return res.end("failure"); }
          res.json(
            {
              originCoor: route.originCoor,
              destinationCoor: route.destinationCoor,
              stopsCoor: route.stopsCoor
            }
          );
        })
      })
      .catch(e => {
        console.log(e);
      });

  	});
  });

  app.post('/route/markpaid', function(req, res) {
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

      var userId = req.body.userId;
      route.riderStatus = route.riderStatus || {};
      route.riderStatus[userId] = route.riderStatus[userId] || {};
      route.riderStatus[userId].paid = true;
      route.markModified('riderStatus');

  		route.save(function(err) {
  			if (err) { console.log(err); }
  			res.end();
  		})
  	});
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

  app.get('/route/new', function (req, res) {
  	if (!req.user) {
  		return res.redirect("/auth/facebook?redirect=" + encodeURIComponent('/route/new'));
  	}

  	var data = {
  		user: req.user,
  		routeId: false,
  		routeData: false,
  		url: req.url,
      	creatingRoute: true
  	};

  	res.render('new_route', {data:data});
  });

  app.get('/route/all', function (req, res) {
  	Route.find({}, function(err, routes) {


      var ids = routes.map(function(r) {
        return r._id;
      });

      res.json(ids);
    });
  });


  app.post('/route/searchAddRider', function(req, res) {
    /*
  	console.log("adding rider");
  	if (!req.user) {
  		return res.end("please log in ");
  	}

  	Route.findById(req.body.routeId).populate('driver').exec(function(err, route) {
      if (req.user._id.toString() == route.driver._id.toString()) {
        return;
      }

  		var rider, riderFound = false, confirmedRider = false;
  		for (var i = 0; i < route.riders.length; i++) {
  			if (route.riders[i].toString() == req.user._id) {
  				riderFound = true;
          rider = route.riders[i];
  				break;
  			}
  		}
  		for (var i = 0; i < route.confirmedRiders.length; i++) {
  			if (route.confirmedRiders[i].toString() == req.user._id) {
  				confirmedRider = true;
  				riderFound = true;
  				break;
  			}
  		}

  		var userId = req.user._id;
  		if (confirmedRider) {
  			console.log("already confirmed");
  			return res.redirect("/route?id=" + (route.shortId || rotue._id) + "&error=1");
  		}

  		if (!riderFound) {
        route.riders.push(userId);
  		}
  		var dropOffs = route.dropOffs || {};
  		dropOffs[req.user._id] = req.body.address;
  		route.dropOffs = dropOffs;

      var onWaitlist = route.confirmedRiders.length == route.seats;
  		route.riderStatus = route.riderStatus || {};
  		route.riderStatus[userId] = {
  			paid: false,
        onWaitlist: onWaitlist,
        baggage: req.body.baggage
  		};
  		route.markModified('dropOffs');
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
  */
  });
}
