
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

      var body = req.body;
      console.log(JSON.stringify(body));
      if (!body.origin || !body.destination || !body['dateRange[]']
          || body['dateRange[]'].length != 2) {
            return res.end("failure");
          }

      var getOrigin = geocode(req.body.origin, gmAPI);
      var getDestination = geocode(req.body.destination, gmAPI);
      var promises = [getOrigin, getDestination];

      Promise.all(promises).then(function(data) {

        var dateRange = [
          new Date(req.body["dateRange[]"][0]),
          new Date(req.body["dateRange[]"][1])
        ];

        var notificationRequest = {
          origin: req.body.origin,
          destination: req.body.destination,
          originCoor: data[0],
          destinationCoor: data[1],
          dateRangeStart: dateRange[0],
          dateRangeEnd: dateRange[1]
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
