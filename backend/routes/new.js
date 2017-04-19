const Promise = require("bluebird");

module.exports = function(app, Route, User, mail) {

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
}
