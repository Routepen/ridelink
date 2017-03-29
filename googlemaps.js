/**
 * Created by Victor on 1/23/2017.
 */
var GoogleMapsAPI = require('googlemaps');
var polyline = require('@mapbox/polyline');

var publicConfig = {
    key: 'AIzaSyBeWLtoD-PTsiqaI1QuPR5y1Vas2P3QStA',
    //key: process.env.GOOGLE_MAPS_KEY,
    stagger_time:       1000, // for elevationPath
    encode_polylines:   false,
    secure:             true, // use https
};
var gmAPI = new GoogleMapsAPI(publicConfig);

var geocodeParams = {
    "address":    "UCSB",
};

gmAPI.geocode(geocodeParams, function(err, result){
    console.log(result.results[0].geometry.location);
});


var request = {
    origin: 'UCSB',
    destination: 'San Francisco',
    travelMode: 'DRIVING'
};

var northMost = 41.998373, westMost = -124.415248,
  southMost = 32.534277, eastMost = -114.140199;

var count1 = 0, count2 = 0, inc = .416;// .416 degrees of lat/lng is about 25 miles
// inc can be adjusted as needed
for (var lng = westMost; lng < eastMost; lng += inc) {
  count1++;
  count2 = 0;
  for (var lat = northMost; lat > southMost; lat -= inc) {
    count2++;
  }
}
console.log(count1, count2);

var compartments = new Array(count1*count2);


gmAPI.directions(request, function(err, result){
    var points = polyline.decode(result.routes[0].overview_polyline.points);
    points.forEach((p, i) => {
      var x = parseInt((p[0] - southMost)/inc), y = parseInt((p[1] - westMost)/inc)
      console.log(x, y);
      var index = x + y*count1;

      var score = compartments[index] || 0;
      score += i / points.length;
      compartments[index] = score;

    })
});
