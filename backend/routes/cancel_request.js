module.exports = function(app, Route) {
  app.post('/route/cancelrequest', function(req, res) {
    if (!req.user) {
      return res.end("please log in ");
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
        return res.redirect("/route?id=" + (route.shortId || rotue._id) + "&error=2");
      }
      var dropOffs = route.dropOffs || {};
      delete dropOffs[req.user._id]
      route.dropOffs = dropOffs;

      route.riderStatus = route.riderStatus || {};
      if (route.riderStatus[removingId]) {
        delete route.riderStatus[removingId];
      }
      route.markModified('dropOffs');
      route.markModified('riderStatus');

      route.save(function(err) {
        if (err) { console.log(err); return res.end(err.toString()); }

        res.end("success");
      })
    });
  });
}
