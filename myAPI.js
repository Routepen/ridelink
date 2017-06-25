var request = require('request');

// DISTANCE IN METERS WITHOUT WAYPOINTS

//result of distance is given in meters from UCSB to Irvington High School. Should be 475296 meters
//Reference - 1609.34 meters in 1 mile
request('http://45.79.65.63:5000/route/v1/driving/-119.8489,34.4140;-121.9670,37.5239?steps=false', function (err, res, body) {
	console.log(JSON.parse(body).routes[0].legs[0].distance);
	//console.log(util.inspect(JSON.parse(body).routes[0].legs[0].distance, {depth:null}))
});

//DISTANCE IN METERS WITH TWO WAYPOINTS. Example - Fresno and 47520 avalon heights terrace

request('http://45.79.65.63:5000/route/v1/driving/-119.8489,34.4140;-119.772587,36.746842;-121.908332,37.488131;-121.9670,37.5239?steps=false', function (err, res, body) {
	console.log( JSON.parse(body).routes[0].distance);
	//console.log(util.inspect(JSON.parse(body).routes[0].legs[0].distance, {depth:null}))
});
