module.exports = function(app, Route, mail) {
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
}
