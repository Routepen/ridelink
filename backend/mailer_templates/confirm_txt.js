module.exports = function(recipientName, driversName, fbLink){
	return 'Hi ' + recipientName + ',\n\n' +
		'Congrats, you\'ve been confirmed by ' + driversName + '! Hope you enjoy your ride!\n\n'+
		'Click here to message them if you have any further questions.\n'+ fbLink +
		'Best,\n'+
		'Routepen Team';
};
