/**
 * Created by Victor on 2/25/2017.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var usersSchema = new Schema({
    firstname: String,
    lastname: String,
    driver: Boolean,
    facebook:{
        id: String,
        token: String,
        email: String,
        name: String,
        photos: String,
        gender: String,
        profileURL: String
    },
    created_at: Date
});

usersSchema.pre('save', function(next) {
    // if created_at doesn't exist, add to that field
    if (!this.created_at)
        var currentDate = new Date();
    this.created_at = currentDate;

    next();
});
/*

 var newUser = User({
 firstname : "Victor",
 lastname: "Cheng",
 driver: false,
 });

 newUser.save(function(err){
 if(err) throw err;
 console.log("User created!");
 });


 */
var User = mongoose.model('users', usersSchema);

module.exports = User;
