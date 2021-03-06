// const GoogleMapsAPI = require('googlemaps');
// const mongoose = require('mongoose');
const Geo_cache = require('./models/Geolocation_cache');

function geocode(place, gmAPI) {
	return new Promise((resolve, reject) => {
		geocodeHelper(place, gmAPI, resolve, reject);
	});
}

function geocodeHelper(place, gmAPI, resFunct, rejFunct){
	return new Promise((resolve, reject) => {
		//Is origin or destination coordinate in the json file?
		Geo_cache.findOne({ location_name: place.name }, (err, location) => {
			if(err) {
				reject(err);
			}
			resolve(location);
		});
	}).then((data) => {
		return new Promise((resolve, reject)=>{
			// If the place was not found in the cache
			console.log(place);
			if(data == undefined){
				gmAPI.geocode( {address: place.name}, (err, result) => {
					console.log(place, err, result);
					if(err) {
						console.log(err);
						return reject(err);
					}
					//if (err) TODO return to home page with a message saying incorrect destination. Try client side verification not server
					data = result.results[0].geometry.location;
					let newEntry = new Geo_cache({
						location_name: place.name,
						lat: data.lat,
						lng: data.lng
					});
					newEntry.save((err) => {
						if (err) { throw err; }
						console.log('successfully saved in cache');
					});
					resFunct(data);
				});
			}
			else {
				resFunct(data);
			}
		});
	}).catch((err) => {
		console.log('rejected', err);
		rejFunct(err);
	});
}

module.exports = geocode;
