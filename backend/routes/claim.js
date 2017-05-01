const util = require("../helpers/util");
const mongoose = require("mongoose");
const Promise = require("bluebird");

module.exports = function(app, Route, DriverlessRoute) {
  app.post('/route/claim', function(req, res) {

    if (!req.user) {
      return res.redirect("/auth/facebook?redirect=" + encodeURIComponent(req.url));
    }

    var ids = req.body.ids;

    if (!ids) {
      ids = [];
    }

    if (typeof ids == "string") {
      ids = [ids];
    }


    console.log("ids", ids);
    DriverlessRoute.find({"driverInfo.name" : req.user.facebook.name}, function(err, routes) {
      if (err) {
        console.log(err);
        res.status(500);
        return res.end("db error");
      }


      var promises = [];

      routes.forEach(function(route) {
        var found = false;
        for (var j = 0; j < ids.length; j++) {
          if (ids[j] == route._id) {
            found = true;
            break;
          }
        }

        if (found) {
          console.log("adding route ", route._id);

          var r = Route(route);
          r._id = mongoose.Types.ObjectId();
          r.driver = req.user._id;
          r.isNew = true;
          delete r._id;

          promises.push(new Promise(function(resolve, reject) {
            r.save(function(err) {
              if (err) { reject(err); }
              else { resolve(r._id); }
            });
          }));
        }
        else {
          console.log("doing nothing with ", routes[i]._id);
        }
        route.remove(function(err) {
          if (err) { console.log(err); }
        });
      });

      Promise.all(promises).then(function(newIds) {
        newIds.forEach(function(id) {
          req.user.routes.push(id);
        });

        req.user.save(function(err) {
          if (err) { console.log(err); }
          console.log(req.body.redirect);
          res.end(req.body.redirect || "/");
        })
      });
    });
  });

  app.get('/route/claim', function(req, res) {

    if (!req.user) {
      return res.redirect("/auth/facebook?redirect=" + encodeURIComponent(req.url));
    }

    DriverlessRoute.find({"driverInfo.name" : req.user.facebook.name}, function(err, routes) {
      if (err) {
        console.log(err);
        res.status(500);
        return res.end("db error");
      }

      var data = {
		user: req.user,
		url: req.url,
		redirect: req.query.redirect,
		view: "",
		action: "",
		routes: routes
		};

      res.render("claim", data);
    });
  });
}
