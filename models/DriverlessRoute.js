/**
 *  on 2/25/2017.
 */
var mongoose = require('mongoose');
var driverlessRouteSchema = require('./routeSchema');
/*
routeSchema.pre('save', function(next) {
    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        var currentDate = new Date();
        this.created_at = currentDate;

    next();
});
*/
var DriverlessRoutes = mongoose.model('driverlessRoutes', driverlessRouteSchema);
module.exports = DriverlessRoutes;

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
