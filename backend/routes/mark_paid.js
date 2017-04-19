module.exports = function(app, Route) {
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
}
