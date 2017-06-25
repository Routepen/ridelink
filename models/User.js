var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var photoSchema = new Schema({
	value: String
});

var usersSchema = new Schema({
	firstname: String,
	lastname: String,
	driver: Boolean,
	facebook:{
		id: String,
		token: String,
		email: String,
		name: String,
		photos: [photoSchema],
		gender: String,
		link: String
	},
	confirmedEmail: String,
	created_at: Date,
	routes:[{
		type:Schema.ObjectId,
		ref:'routes'
	}],
	notificationRequests: [{
		type:Schema.ObjectId,
		ref:'notificationRequest'
	}]
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
