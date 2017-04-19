const Promise = require("bluebird");

module.exports = function(app, Route, User, mail) {
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
}
