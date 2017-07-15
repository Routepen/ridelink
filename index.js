'use strict';
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const User = require('./models/User');
const Route = require('./models/Route');
const DriverlessRoute = require('./models/DriverlessRoute');
const NotificationRequests = require('./models/notificationRequests');
const mail = require('./mail');
const geocode = require('./geocode');
const app = express();
const GoogleMapsAPI = require('googlemaps');

const auth = require('./auth');
const ENV = require('./backend/helpers/env');

/* Mongodb connection setup */
const db = require('./backend/helpers/db-setup');

ENV.printMode();

var gmAPI = new GoogleMapsAPI({
	key: process.env.GMAPI_KEY,
	stagger_time:       1000, // for elevationPath
	encode_polylines:   false,
	secure:             true, // use https
});

app.set('port', (process.env.PORT || 5000));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// parse cookie sessions
app.use(session({
	resave: true,
	saveUninitialized: true,
	secret: 'Thisshouldbemademoresecure'
}));


auth.setUpAuth(app);

// Routes
require('./backend/routes/routes')(app, Route, DriverlessRoute, User, NotificationRequests, mail, gmAPI, geocode);

app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'));
});
