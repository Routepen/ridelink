/**
 * Created by Victor on 2/25/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var notificationRequestSchema = new Schema({
  user:{
      type:Schema.ObjectId,
      ref:'users'
  },
  requests: [{
    origin: String,
    destination: String,
    originCoor: {"lat": Number, "lng": Number},
    destinationCoor: {"lat": Number, "lng" : Number},
    until: Date
  }]
});

notificationRequestSchema.pre('save', function(next) {
    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        var currentDate = new Date();
    this.created_at = currentDate;

    next();
});

var notificationRequests = mongoose.model('notificationRequest', notificationRequestSchema);

module.exports = notificationRequests;
