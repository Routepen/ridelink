/**
 * Created by Victor on 2/25/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var routeSchema = new Schema({
    origin: String,
    destination: String,
    seats: Number,
    date: Date,
    //date: {type: Date, default: Date.now},
    driver: {
        type: Schema.ObjectId,
        ref: 'users'
    },
    riders: [{
        type: Schema.ObjectId,
        ref: 'users'
    }],
    inconvenience: { type: [Number], default: 9999 },
    bailed: { type: [Boolean], default: false },

    created_at: Date
});

routeSchema.pre('save', function (next) {
    // if created_at doesn't exist, add to that field
    if (!this.created_at) var currentDate = new Date();
    this.created_at = currentDate;

    next();
});

var Route = mongoose.model('routes', routeSchema);
module.exports = Route;

/*

 var newRoute = Route({
 origin: "UCSB",
 destination: "47520 Avalon Heights Terrace",
 driver: "58b25a4e4837cb41284df95d",
 riders:[
 "58b25a4e4837cb41284df95d"
 ]
 });

 newRoute.save(function(err){
 if(err) throw err;
 console.log("Route created!");
 });
 */

//# sourceMappingURL=route-compiled.js.map