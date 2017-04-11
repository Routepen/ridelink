const GoogleMapsAPI = require('googlemaps');
const jsonfile = require('jsonfile');
const jsonUpdate = require('json-update');

function geoencoding(origin, destination, gmAPI, resFunct, rejFunct){
  var file = './geolocation_cache.json';

  //Data[0] is originCoordinate and Data[1] is destinationCoordinate

  let jsonFilePromise = new Promise((resolve, reject) =>{
    //Is origin or destination coordinate in the json file?
    jsonfile.readFile(file, function(err,obj){
      if(err)
        reject(err);
      var originCoor = obj[origin];
      var destinationCoor = obj[destination];
      resolve([originCoor, destinationCoor]);
    });
  });
  jsonFilePromise.then( function(data){
    // If the origin coordinate is not in the json file already
    return new Promise((resolve, reject)=>{
      if(data[0] == undefined){
        gmAPI.geocode( { "address": origin }, function(err, result){
          if(err)
            reject(err);
            //if (err) TODO return to home page with a message saying incorrect destination. Try client side verification not server
          data[0] = result.results[0].geometry.location;
          var newEntry = {};
          newEntry[origin] = data[0];
          jsonUpdate.update(file, newEntry);
          resolve([data[0], data[1]]);
        });
      }
      else{
        resolve([data[0], data[1]]);
      }
    });
  })
  .then( function(data){
    // If the destination coordinate is not in the json file already
    return new Promise((resolve, reject) => {
      if(data[1] == undefined){
        gmAPI.geocode( { "address": destination }, function(err, result){
          if(err)
            reject(err);
          //if (err) TODO return to home page with a message saying incorrect destination
          data[1] = result.results[0].geometry.location;
          var newEntry = {};
          newEntry[destination] = data[1];
          jsonUpdate.update(file, newEntry);
          resolve([data[0], data[1]]);
        });
      }
      else{
        resolve([data[0], data[1]]);
      }
    });
  })
  .then( function(data){
    resFunct([data[0], data[1]]);
  }).catch((err) => {
    console.log('rejected');
    rejFunct(err);
  });
  return 0;
}

module.exports = search;
