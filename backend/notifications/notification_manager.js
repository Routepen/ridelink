const notificationRequests = require("../../models/notificationRequests");
const User = require("../../models/User");
const mail = require("../../mail");

module.exports = {
  onRouteCreated: function(route) {
    notificationRequests.find({}, function(err, requests) {
      console.log(err, requests);
      if (err) { console.log(err); return; }

      if (!requests) { return; }

      requests.forEach(function(request) {
        console.log("for each", request);
        request.requests.forEach(function(requestData) {
          console.log("rd", requestData);
          if (true) { //route is relevent
            User.findOne({_id: request.user}, function(err, user) {
              console.log("user", err, user);
              if (err) { console.log(err); return; }
              if (!user) { return; }

              mail.sendMail({
                notifyRider: {
                  releventRouteAdded: true
                },
                recipient: user,
                route: route
              });

            });
          }
        });
      });
    });
  }

}
