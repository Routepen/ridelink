
module.exports = function(app, NotificationRequests, gmAPI, geocode) {
  app.post("/route/requestnotifications", function(req, res) {
    if (!req.user) {
      return res.status(300).end("not logged in");
    }

    NotificationRequests.findOne({user: req.user._id}, function(err, request) {
      if (err) { console.log(err); return res.status(500).end(""); }

      if (!request) {
        request = new NotificationRequests({
          user: req.user,
          requests: []
        });
      }

      if (request.requests.length >= 5) {
        return res.end("too many requests");
      }

      for (var i = 0; i < request.requests.length; i++) {
        if (req.body.origin == request.requests[i].origin &&
            req.body.destination == request.requests[i].destination) {
              return res.end("notifications request already exists");
            }
      }

      var getOrigin = geocode(req.body.origin, gmAPI);
      var getDestination = geocode(req.body.destination, gmAPI);
      var promises = [getOrigin, getDestination];

      Promise.all(promises).then(function(data) {

        var notificationRequest = {
          origin: req.body.origin,
          destination: req.body.destination,
          originCoor: data[0],
          destinationCoor: data[1],
          until: new Date(req.body.until)
        };

        request.requests.push(notificationRequest);

        request.save(function(err) {
          if (err) { console.log(err); return res.status(500).end(""); }

          res.end("success");
        });
      })
      .catch(function(err) {
        console.log(err);
        res.end("failure");
      });


    });
  });
};
