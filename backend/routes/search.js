module.exports = function(app, Route, User, gmAPI) {
  const util = require('util');
  const geocode = require('../../geocode');

  app.get('/search', (req, res) => {

  	//TODO do error handling on user sending in invalid origin/destination
    let getOrigin = geocode(req.query.origin, gmAPI);
    let getDestination = geocode(req.query.destination, gmAPI);

    Promise.all([getOrigin, getDestination])
    .then((data) => {
      new Promise((resolve, reject) => {
        //{"date" : {"$gte" : new Date(Date.now())}} occurs
        var closeRoutes = [];
        Route.find({"date" : {"$gte" : new Date(Date.now())}}).sort({date:'ascending'}).populate('driver').exec(function (err, routes) {
          let counter = 0;
          if(routes.length == 0){
            resolve([]);
          }
          routes.forEach(function (route) {
            var requestURL = `http://45.79.65.63:5000/route/v1/driving/${route['originCoor'].lng},${route['originCoor'].lat};` +
            `${data[0].lng},${data[0].lat};${data[1].lng},${data[1].lat};` +
            `${route['destinationCoor'].lng},${route['destinationCoor'].lat}?steps=false`;
            console.log(requestURL);
            request(requestURL, function (err, res, body) {
                // Short error handling for testing
                if(err){
                  console.log(err);
                  res.status(300).end('error with requesting to API');
                }

                counter++; // using counter to keep track of how many completed requests *less clunky option to Promise*
                var distance = util.inspect(JSON.parse(body).routes[0].distance);

                // Temporarily has 1 == 1 because distance not stored in DB
                //TODO should be dbentry.distance .some threshold to distance variable +=9% of original distance
                var routeDist = parseInt(route.distance);
                console.log('route distance is ', routeDist, ' and distance is ', distance);
                console.log(routeDist / distance);
                if( routeDist/distance >= 0.9   &&  routeDist/distance < 1.2 ){
                  closeRoutes.push(route);
                }

                // If all requests have been returned then resolve with the array of close routes
                if(counter == routes.length){
                  resolve(closeRoutes);
                }
            });
          });
        });
      })
      .then((closeRoutes) => {
        //render
        // TODO Fill in Maps API call and send JSON to front end to parse
        var credentials = {
          user: req.user,
          url: req.url,
          origin: req.query.origin,
          destination: req.query.destination,
          closeRoutes: closeRoutes // An array of all relevant routes
        };
        console.log(credentials.closeRoutes);
        res.render("search_route", credentials);
      });
    })
    .catch((err)=>{
      console.err("Global error");
      console.err(err);
      res.status(300).send('Error!');
    });

  	/*
  	var dummy = request('http://45.79.65.63:5000/route/v1/driving/-122,37;-122,37.001?steps=true', function (err, res, body) {
  		console.log(util.inspect(JSON.parse(body), {depth:null}))
  	});
  	var geocodeParams = {
  		"address": req.body.origin,
  	};
  	gmAPI.geocode(geocodeParams, function(err, result){
  		console.log(result.results[0].geometry.location);
  	});
  	*/

  });
}
