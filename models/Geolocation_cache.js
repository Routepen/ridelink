const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const geo_cache = new Schema({
  location_name: {
    type: String,
    required: true
  },
  lat: {
    type: Number,
    required: true
  },
  lng: {
    type: Number,
    required: true
  }
});


var Geolocation_cache = mongoose.model('geo_cache', geo_cache);

module.exports = Geolocation_cache;
