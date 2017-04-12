const GoogleMapsAPI = require('googlemaps');
const jsonfile = require('jsonfile');
const jsonUpdate = require('json-update');


function geocode(place, gmAPI) {
  return new Promise((resolve, reject) => {
    geocodeHelper(place, gmAPI, resolve, reject);
  });
}

function geocodeHelper(place, gmAPI, resFunct, rejFunct){
  var file = './geolocation_cache.json';

  new Promise((resolve, reject) =>{
    //Is origin or destination coordinate in the json file?
    jsonfile.readFile(file, function(err, obj){
      if(err){
        reject(err);
      }
      var placeCoor = obj[place];
      resolve(placeCoor);
    });
  })
  .then((data) => {
    return new Promise((resolve, reject)=>{
      // If the place was not found in the cache
      if(data == undefined){
        gmAPI.geocode( { "address": place }, (err, result) => {
          if(err) {
            reject(err);
          }
            //if (err) TODO return to home page with a message saying incorrect destination. Try client side verification not server
          data = result.results[0].geometry.location;
          var newEntry = {};
          newEntry[origin] = data;
          jsonUpdate.update(file, newEntry);
          resFunct([data[0], data[1]]);
        });
      }
      else {
        resFunct([data[0], data[1]]);
      }
    });
  })
  .catch((err) => {
    console.log('rejected', err);
    rejFunct(err);
  });
  return 0;
}

module.exports = geocode;
