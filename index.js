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

require("./backend/routes/routes")(app, Route, User, gmAPI);

app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'))
});
