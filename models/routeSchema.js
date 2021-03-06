var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var routeSchema = new Schema({
	shortId: {type: String, unique: true},
	origin: {
		name: {
			type: String,
			required: true
		},
		place_id: {
			type: String,
			required: true
		}
	},
	destination: {
		name: {
			type: String,
			required: true
		},
		place_id: {
			type: String,
			required: true
		}
	},
	originCoor: {'lat': Number, 'lng': Number},
	destinationCoor: {'lat': Number, 'lng' : Number},
	seats: Number,
	date: Date,
	time: String,
	driver: {
		type:Schema.ObjectId,
		ref:'users'
	},
	driverInfo: {
		'name': String,
		'profilePictureURL': String,
	},
	riders:[{
		type:Schema.ObjectId,
		ref:'users'
	}],
	confirmedRiders:[{
		type:Schema.ObjectId,
		ref:'users'
	}],
	stopsCoor: [{'lat':Number, 'lng': Number}],
	stops: [{'lat': Number, 'lng': Number}],
	pickUps: Schema.Types.Mixed,
	dropOffs: Schema.Types.Mixed,
	riderStatus: Schema.Types.Mixed,
	inconvenience: {type:[Number], default: 9999},
	requireInitialDeposit: Boolean,
	bailed: {type:[Boolean], default: false},
	opened: {type: Boolean, default: false},
	isWaitlisted: Boolean,
	created_at: Date,
	distance: Number
});

module.exports = routeSchema;
