module.exports = function(recipientName, driversName, signUpLink){
	return '<span>Hi ' + recipientName + ',</span><br/><br/>' +
				'<span>Welcome to Routepen! </span><br/><br/>' +
				'<span>Congrats on signing up with ' + driversName + '\'s ride through Routepen! We\'ll give you another follow up email once ' + driversName + ' has confirmed you as a passenger they want to take. We\'ll also keep you posted on any change of plans for you!</span><br/><br/>' +
				'<span><b> New Rider Feature </b></span><br/><br/>' +
				'<span>If you find yourself having a hard time finding rides, we\'re rolling out a new Instant notifications feature. We give you a notification every time there is a ride on the way or to where you\'re trying to go. If you find yourself having a tough time finding rides, ' + signUpLink + ' and you\'ll be the first to know about it. We only have 300 spots, so sign up quick!</span><br/><br/>' +
				'<span>In the meantime, find other drivers through the Facebook Groups (Bay Area, SoCal, and the Regular). Pin your dropoff location. And let us handle the rest for you! :)</span><br/><br/>' +
				'<span>Best,</span><br>' +
				'<span>Routepen Team</span>';
};
