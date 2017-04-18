module.exports = function(app, Route) {
  app.post('/route/confirmrider', function(req, res) {
    if (!req.user) {
      return res.end("please log in ");
    }

    Route.findById(req.body.routeId).populate('driver').populate('riders').populate('confirmedRiders').exec(function(err, route) {
      if (err) {
        return res.end(err.toString());
      }

      if (route.driver._id.toString() != req.user._id.toString()) {
        return res.end("nice try hacker");
      }

      if (route.confirmedRiders.length >= route.seats) {
        return res.end("failure");
      }

      for (var i = 0; i < route.riders.length; i++) {
        if (route.riders[i].id == req.body.userId) {
          route.riders.splice(i, 1);
          break;
        }
      }

      var found = false;
      for (var i = 0; i < route.confirmedRiders.length; i++) {
        if (route.confirmedRiders[i].id == req.body.userId) {
          found = true;
          break;
        }
      }

      var onWaitlist = route.riderStatus[req.body.userId].onWaitlist;
      if (!found) {
        route.confirmedRiders.push(req.body.userId);
        route.riderStatus[req.body.userId].confirmedOn = new Date(Date.now());
        route.riderStatus[req.body.userId].onWaitlist = false;
        route.markModified('riderStatus');
        if (route.confirmedRiders.length >= route.seats) {
          route.isWaitlisted = true;
        }
      }

      User.findById(req.body.userId, function(err, rider) {
        if (onWaitlist) {
          mail.sendMail({
            recipient: rider,
            route: route,
            notifyRider: {
              offWaitlist: true
            }
          });
        }
        else {
          mail.sendMail({
            recipient: rider,
            route: route,
            notifyRider: {
              confirmed: true
            }
          });
        }
      });


      route.save(function(err) {
        if (err) { return res.end(err.toString()); }
        res.end("success");
      });
    });
  });
}
