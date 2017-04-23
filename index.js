'use strict'
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const User = require('./models/User');
const Route = require('./models/Route');
const _ = require("lodash");
const mail = require("./mail");
const geocode = require('./geocode');
const app = express();
const GoogleMapsAPI = require('googlemaps');
const async = require('async');

const auth = require("./auth");

mongoose.Promise = require('bluebird');

var mongo_url = 'mongodb://127.0.0.1:27017/ridelink' || process.env.MONGODB_URI;
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
	key: process.env.GMAPI_KEY,
	stagger_time:       1000, // for elevationPath
	encode_polylines:   false,
	secure:             true, // use https
};
var gmAPI = new GoogleMapsAPI(publicConfig);

db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', () => {
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

// Routes
require("./backend/routes/routes")(app, Route, User, mail, gmAPI, geocode);

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

app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
});
