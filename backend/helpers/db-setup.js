const mongoose = require('mongoose');

mongoose.Promise = require('bluebird');

var mongo_url = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ridelink';

mongoose.connect(mongo_url,  {
	useMongoClient: true
}).then(() => {
	console.log(`Connected to mongodb connection ${mongo_url}`)
}).catch((err) => {
	throw err;
});

module.exports = mongoose;