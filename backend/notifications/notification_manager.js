const notificationRequests = require("../../models/notificationRequests");
const User = require("../../models/User");
const mail = require("../../mail");
const utils = require("../helpers/util");

module.exports = {
  onRouteCreated: function(route) {
    notificationRequests.find({}, function(err, requests) {
      if (err) { console.log(err); return; }
      if (!requests) { return; }

      requests.forEach(function(request) {
        request.requests.forEach(function(rd) {

          utils.routes.areClose(route.originCoor, route.destinationCoor, rd.originCoor, rd.destinationCoor, route.distance).then(function(areClose) {
            if (areClose) {

              User.findOne({_id: request.user}, function(err, user) {
                if (err) { console.log(err); return; }
                if (!user) { console.log("couldn't find user with id ", request.user); return; }

                mail.sendMail({
                  notifyRider: {
                    releventRouteAdded: true
                  },
                  recipient: user,
                  route: route
                });
              });
            }

          })
          .catch(function(err) {
            console.log(err);
          });

        });
      });
    });
  }

}
