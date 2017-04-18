/**
 * Created by Victor on 2/25/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var emailSubscribe = new Schema({
    email: String,
    date: Date
});


var EmailSubscribe = mongoose.model('emailsubscribe', emailSubscribe);
module.exports = EmailSubscribe;
