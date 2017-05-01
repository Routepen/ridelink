const util = require('util');
const request = require('request');
const DriverlessRoute = require('../../models/DriverlessRoute');
const _ = require("lodash");

var haveSameUser = function(url1, url2) {
  //https://scontent-lax3-2.xx.fbcdn.net/v/t1.0-1/p64x64/12729183_959477910800454_5056109822890601521_n.jpg?oh=17639704849009b909e58b33d2de59f2&oe=5985683B
  //https://scontent.xx.fbcdn.net/v/t1.0-1/p50x50/12729183_959477910800454_5056109822890601521_n.jpg?oh=562adc41c2be61572a0dc246e3d2c670&oe=598DA8B4

  if (!url1 || !url2) { return false; }

  var t1 = url1, t2 = url2;

  // we care about the xxxxxx.jpg
  t1 = t1.substr(0, t1.indexOf('.jpg'));
  t2 = t2.substr(0, t2.indexOf('.jpg'));

  t1 = t1.substr(t1.lastIndexOf('/'));
  t2 = t2.substr(t2.lastIndexOf('/'));

  if (t1 == "") { // we messed up
    console.log("Problem parsing url", url1);
    return false;
  }
  if (t2 == "") { // we messed up
    console.log("Problem parsing url", url2);
    return false;
  }

  return t1 == t2;
}

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

  },

  profilePicture: {
    haveSameUser: haveSameUser
  },

  user: {
    couldHaveDriverlessRoutes: function(user) {
      return new Promise(function(resolve, reject) {
        DriverlessRoute.find({"date": {"$gte": new Date(Date.now())}}, function(err, routes) {
          if (err) { console.log(err); return reject(err); }

          if (!routes) { return resovle(false); }

          for (var i = 0; i < routes.length; i++) {
            if (haveSameUser(routes[i].driverInfo.profilePictureURL, _.get(user, "facebook.photos[0].value"))) {
              return resolve(true);
            }
          }

          resolve(false);
        });
      });
    }
  }
}
