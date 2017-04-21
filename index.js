'use strict'
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const mongoose = require('mongoose');
const session = require('express-session');
const User = require('./models/User');
const Route = require('./models/Route');
const EmailSubscribe = require('./models/EmailSubscribe');
const util = require('util');
const _ = require("lodash");
const app = express();
const GoogleMapsAPI = require('googlemaps');
const geocode = require('./geocode');
const async = require('async');

const auth = require("./auth");
const mail = require("./mail");
const payment = require("./payments");


mongoose.Promise = require('bluebird');
var mongo_url = 'mongodb://127.0.0.1:27017/ridelink';
if(process.env.NODE_ENV == "production") {
  mongo_url = process.env.MONGODB_URI;
}
console.log(mongo_url);
  mongoose.connect(mongo_url,  {
  server: {
    socketOptions: {
      socketTimeoutMS: 0,
      connectTimeoutMS: 0
    }
  }
});
var db = mongoose.connection;

var publicConfig = {
	key: 'AIzaSyBeWLtoD-PTsiqaI1QuPR5y1Vas2P3QStA',
	//key: process.env.GOOGLE_MAPS_KEY,
	stagger_time:       1000, // for elevationPath
	encode_polylines:   false,
	secure:             true, // use https
};
var gmAPI = new GoogleMapsAPI(publicConfig);

/*
var config = require('./webpack.config.js');
var webpack = require('webpack');
var webpackDevMiddleware = require('webpack-dev-middleware');
var webpackHotMiddleware = require('webpack-hot-middleware');

var compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {noInfo: true, publicPath: config.output.publicPath}));
app.use(webpackHotMiddleware(compiler));
*/

/*
const isAuthenticated = (req, res, next) =>
	if (req.isAuthenticated())
		return next();
	res.json({});
*/


db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
	console.log("we're connected!");
});


app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));

// parse cookie sessions
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: "Thisshouldbemademoresecure"
}));

// parse application/json
app.use(bodyParser.json());

auth.setUpAuth(app);
payment.setUp(app, mail, Route);

app.get('/', function (req, res) {
	var data = {
		user: req.user,
		url: req.url
	};

	res.render('new_landing', data);
	//res.render('index', {data:data});
});

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
              console.log(routeDist/distance);
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

require("./backend/routes/routes")(app, Route, User, mail);

app.get('/sendMail', function(req, res) {
  var n = req.query.n;
  if (n == "1") {
    mail.sendMail({
      notifyDriver: {
        routeCreated: true
      },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n == "2") {
    mail.sendMail({
      notifyRider: {
        signedUp: true
      },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n == "3") {
    mail.sendMail({
      notifyRider: {
        confirmed: true
      },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="4") {
    mail.sendMail({
      notifyRider: {
        offWaitlist: true
      },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="5") {
    mail.sendMail({
      notifyRider: {
        infoChanged: true
      },
      driver: {facebook:{name: "Porter Haet"} },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="6") {
    mail.sendMail({
      notifyRider: {
        offWaitlist: true
      },
      driver: {facebook:{name: "Porter Haet"} },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="7") {
    mail.sendMail({
      notifyRider: {
        paid: true
      },
      driver: {facebook:{name: "Porter Haet"} },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="8") {
    mail.sendMail({
      notifyRider: {
        shouldBePickedUp: true
      },
      driver: {facebook:{name: "Porter Haet"} },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="9") {
    mail.sendMail({
      notifyRider: {
        joinedFeatureWaitlist: true
      },
      driver: {facebook:{name: "Porter Haet"} },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="10") {
    mail.sendMail({
      notifyDriver: {
        riderAdded: true
      },
      driver: {facebook:{name: "Porter Haet"} },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="11") {
    mail.sendMail({
      notifyDriver: {
        riderPaid: true
      },
      driver: {facebook:{name: "Porter Haet"} },
      to: 'pmh192@gmail.com'
    });
  }
  else if (n=="12") {
    mail.sendMail({
      notifyDriver: {
        shouldBePickingUp: true
      },
      driver: {facebook:{name: "Porter Haet"} },
      to: 'pmh192@gmail.com'
    });
  }
  res.end("");
});

app.get('/testing2', function(req, res) {
	var newUser = new User({
    "facebook": {
        "link": "https://www.facebook.com/app_scoped_user_id/1275391965875712/",
        "gender": "male",
        "email": "",
        "name": "Test User1",
        "token": "EAAP9KxoqCucBAMF22hAWQD5cNryPVRSAsAVy0qIGgMMKH8AkIMiucu8HbJJHYTa1ZBjFnfGiVv1wnIqcjZAMHmIUuSEHJtsZAdeCmyDHwvZAxQOrJpMrOFh9fvZAxxqHFcZAzMlWHVWCPh9MBFSYGFNLGMEO5xzzqo0aa3TyRhOwZDZD",
        "id": "1275391965875713",
        "photos": [
            {
                "value": "https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/12729183_959477910800454_5056109822890601521_n.jpg?oh=ce58e8e7a372cbc9e18bab4f24409c4d&oe=59661BB4"
            }
        ]
    },
    "confirmedEmail": "pmh192@gmail.com"
	});

	newUser.save(function(err) {
		if (err) console.log(err);
		res.end("saved" + JSON.stringify(newUser));
	});
});

app.get('/test3', function(req, res) {
	User.findById('58f5931ef5a31b2723a7696f', function(err, user) {
		req.logIn(user, function(err) {
      if (err) { console.log(err); }
      return res.redirect('/');
    });
	});
});

app.get('/test32', function(req, res) {
	User.findById('58f6cbb094d39b315af7bf8e', function(err, user) {
		req.logIn(user, function(err) {
      if (err) { console.log(err); }
      return res.redirect('/');
    });
	});
});


app.get('/profile', function(req, res){
	res.render('profile');
});

app.get('/route/mine', function(req, res){
	if (!req.user) {
		return res.redirect("/auth/facebook?redirect=" + encodeURIComponent('/route/mine'));
	}

	Route.find({ _id: {$in:req.user.routes}}, function(err, routes) {
		var data = {
			user: req.user || false,
			url: req.url,
			routes: routes
		};

		res.render('userRoutes', data);
	});
});

app.get('/test4', function(req, res) {
	mail.sendMail({
		notifyDriver: {
			riderAdded: true
		},
		to: 'pmh192@gmail.com'
	});
	res.end();
});


// For testing purposes only
app.get('/rider', function (req, res) {
	res.render('partials/driver_input');
});

function random(len) {
	var a = new Array(len);
	var ranges = [[48, 10], [65, 26], [97, 26]], total = 62;
	for (var i = 0; i < len; i++) {
		var random = parseInt(Math.random() * total);
		for (var n = 0; n < ranges.length; n++) {
			if (random < ranges[n][1]) {
				a[i] = String.fromCharCode(ranges[n][0] + random);
				break;
			}
			random -= ranges[n][1];
		}
	}

	return a.join('');
}

app.post('/emailsubscribe', function(req,res){
	var subscriber = EmailSubscribe({
		email: req.body.email
	});

	subscriber.save(function(err){
		if(err) throw err;
		return res.redirect("/");
	});
});


app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
});
