const utils = require('../helpers/util');

module.exports = function(app, Route, User, gmAPI, geocode) {

	app.get('/search', (req, res) => {
		if (!req.query.origin || !req.query.destination || req.query.origin == '' || req.query.origin == '') {
			return res.status(401).send('What are you trying to do?');
		}
		//TODO do error handling on user sending in invalid origin/destination
		let getOrigin = geocode(req.query.origin, gmAPI);
		let getDestination = geocode(req.query.destination, gmAPI);

		Promise.all([getOrigin, getDestination])
			.then((data) => {
				new Promise((resolve, reject) => {
					//{"date" : {"$gte" : new Date(Date.now())}} occurs
					var closeRoutes = [];
					Route.find({'date' : {'$gte' : new Date(Date.now())}}).sort({date:'ascending'}).populate('driver').exec(function (err, routes) {
						let counter = 0;
						if(err) return reject(err);
						if(routes.length == 0){
							return resolve([]);
						}
						routes.forEach(function (route) {
							// var requestURL = `http://45.79.65.63:5000/route/v1/driving/${route['originCoor'].lng},${route['originCoor'].lat};` +
							// `${data[0].lng},${data[0].lat};${data[1].lng},${data[1].lat};` +
							// `${route['destinationCoor'].lng},${route['destinationCoor'].lat}?steps=false`;
							// request(requestURL, function (err, res, body) {
							utils.routes.areClose(route['originCoor'], route['destinationCoor'], data[0], data[1], route.distance)
								.then(function(areClose) {

									counter++; // using counter to keep track of how many completed requests *less clunky option to Promise*
									if(areClose){
										closeRoutes.push(route);
									}

									// If all requests have been returned then resolve with the array of close routes
									if(counter == routes.length){
										resolve(closeRoutes);
									}
								})
								.catch(function(err) {
									console.log(err);
									res.status(300).end('error with requesting to API');
								});
						});
					});
				})
					.then((closeRoutes) => {
						//render
						// TODO Fill in Maps API call and send JSON to front end to parse
						var credentials = {
							data: {
								user: req.user,
								notifications: req.query.notifications || null,
								signup: req.query.signup || null,
								url: req.url,
								origin: req.query.origin,
								destination: req.query.destination,
								closeRoutes: closeRoutes // An array of all relevant routes
							}
						};
						res.render('search_route', credentials);
					})
					.catch((err) => {
						console.log(err);
						res.status(300).send('Error!');
					});
			})
			.catch((err)=>{
				console.err('Global error');
				console.err(err);
				res.status(300).send('Error!');
			});
		/*
		var dummy = request('http://45.79.65.63:5000/route/v1/driving/-122,37;-122,37.001?steps=true', function (err, res, body) {
			console.log(require('util').inspect(JSON.parse(body), {depth:null}));
		});
		var geocodeParams = {
			'address': req.body.origin,
		};
		gmAPI.geocode(geocodeParams, function(err, result){
			console.log(result.results[0].geometry.location);
		});
		*/


	});
};
