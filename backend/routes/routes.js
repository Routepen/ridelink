var _ = require("lodash");

module.exports = function(app, Route, User, mail, geocode, gmAPI, util) {

  require("./add_rider")(app, Route, User, mail);

  require("./remove_rider")(app, Route, mail);

  require("./cancel_request")(app, Route);

  require("./confirm_rider")(app, Route, User, mail);

  require("./rider_paid")(app, Route, mail);

  require("./new")(app, Route, User, mail);

  require("./update")(app, Route, User, mail);

  require("./mark_paid")(app, Route);

  require("./get_route")(app, Route);

  require("./search_add_rider")(app, Route, User, mail);

  require("./mail")(app, mail);

  require("./search")(app, Route, User, geocode, gmAPI, util);

  app.get('/route/all', function (req, res) {
  	Route.find({}, function(err, routes) {


      var ids = routes.map(function(r) {
        return r._id;
      });

      res.json(ids);
    });
  });
}
