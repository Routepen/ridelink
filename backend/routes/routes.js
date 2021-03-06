// var _ = require('lodash');

module.exports = function(app, Route, DriverlessRoute, User, NotificationRequests, mail, gmAPI, geocode) {

	require('./add_rider')(app, Route, User, mail);

	require('./remove_rider')(app, Route, User);

	require('./cancel_request')(app, Route, User);

	require('./confirm_rider')(app, Route, User, mail);

	require('./rider_paid')(app, Route, mail);

	require('./new')(app, Route, DriverlessRoute, User, mail, gmAPI, geocode);

	require('./update')(app, Route, User, mail, gmAPI, geocode);

	require('./mark_paid')(app, Route);

	require('./get_route')(app, Route);

	require('./search_add_rider')(app, Route, User, mail);

	require('./mail')(app, mail);

	require('./search')(app, Route, User, gmAPI, geocode);

	require('./notifications')(app, NotificationRequests, User, gmAPI, geocode);

	require('./claim')(app, Route, DriverlessRoute);

	require('./remove_rider_entirely')(app, Route, User);

	require('../test/testRoutes')(app, User);

	app.get('/newlanding', function(req,res) {
		var data = {
			user: req.user,
			url: req.url
		}
		res.render('newlanding', data)
	});

	app.get('/profile', function(req, res){
		res.render('profile');
	});

	app.get('/', function (req, res) {
		var data = {
			data: {
				user: req.user,
				url: req.url
			}
		};
		res.render('landing', data);
	});

	app.get('/route/all', function (req, res) {
		Route.find({}, function(err, routes) {

			var ids = routes.map(function(r) {
				return r._id;
			});

			res.json(ids);
		});
	});

	app.get('/route/mine', function(req, res){
		if (!req.user) {
			return res.redirect('/auth/facebook?redirect=' + encodeURIComponent('/route/mine'));
		}

		Route.find({ _id: {$in:req.user.routes}}, function(err, routes) {
			var data = {
				data: {
					user: req.user || false,
					url: req.url,
					routes: routes
				}
			};

			res.render('userRoutes', data);
		});
	});

	require('./test')(app);
};
