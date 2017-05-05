const Promise = require("bluebird");
const NotificationManager = require("../notifications/notification_manager");

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

    var originCoor, destinationCoor;

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

    var driver, driverInfo; // should only store one
    if (req.body.driverInfo) {
      driverInfo = req.body.driverInfo;
      driver = undefined;
    }
    else {
      driver = req.user._id;
      driverInfo = undefined;
    }

    Promise.all(promises).then(data => {
      let originCoor = data[0];
      let destinationCoor = data[1];
      let stopsCoor = data.splice(2);
      var newRoute;
      var routeData = {
        shortId: random(5),
        origin: req.body.origin,
        destination: req.body.destination,
        originCoor: originCoor,
        destinationCoor: destinationCoor,
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
        stops: req.body["stops[]"],
        stopsCoor: stopsCoor,
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

        var redirectTo = "/route?id=" + (newRoute.shortId || newRoute._id);
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
  		return res.redirect("/auth/facebook?redirect=" + encodeURIComponent('/route/new'));
  	}

  	var data = {
  		user: req.user,
  		routeId: false,
  		routeData: false,
  		url: req.url,
      creatingRoute: true,
      isDriver: false,
      view: "",
      action: ""
  	};

	   res.render('new_route', data);
  });

  app.get('/route/newDriverLess', function (req, res) {
	   res.render('new_route_driverless');
  });

}
