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

gmAPI.directions(request, function(err, result){
    console.log(polyline.decode(result.routes[0].overview_polyline.points));
    // for each element in the polyline array figure out if it is on the way or to your location
});




