module.exports = function(app, Route) {

app.post('/route/removerider', function(req, res) {
    if (!req.user) {
      return res.end("please log in ");
    }

    var removingId = req.body.userId;

    Route.findById(req.body.routeId, function(err, route) {

      if (req.user._id.toString() != route.driver.toString()) {
        console.log("hacking");
        return res.end("failure");
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
        return res.redirect("/route?id=" + (route.shortId || rotue._id) + "&error=2");
      }
      var dropOffs = route.dropOffs || {};
      delete dropOffs[req.user._id]
      route.dropOffs = dropOffs;

      route.riderStatus = route.riderStatus || {};
      route.riderStatus[removingId] = route.riderStatus[removingId] || {
        paid: false
      };
      route.markModified('dropOffs');
      route.markModified('riderStatus');

      route.save(function(err) {
        if (err) { console.log(err); return res.end(err.toString()); }

        res.end("success");
      })
    });
  });
}
