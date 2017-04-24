const util = require('util');
const request = require('request');

module.exports = {
  routes: {

    areClose: function(origCoor1, destCoor1, origCoor2, destCoor2, originalDistance) {
      return new Promise(function(resolve, reject) {
        var requestURL = `http://45.79.65.63:5000/route/v1/driving/${origCoor1.lng},${origCoor1.lat};` +
        `${origCoor2.lng},${origCoor2.lat};${destCoor2.lng},${destCoor2.lat};` +
        `${destCoor1.lng},${destCoor1.lat}?steps=false`;
        request(requestURL, function (err, res, body) {
          // Short error handling for testing
          if(err){
            return reject(err);
          }

          var distance = util.inspect(JSON.parse(body).routes[0].distance);

          // Temporarily has 1 == 1 because distance not stored in DB
          //TODO should be dbentry.distance .some threshold to distance variable +=9% of original distance
          var routeDist = parseInt(originalDistance);
          console.log('route distance is ', routeDist, ' and distance is ', distance);
          console.log('Inconvenience factor:', routeDist / distance);
          resolve(routeDist/distance >= 0.9  &&  routeDist/distance < 1.2);
        });
      });
    }

  }
}
