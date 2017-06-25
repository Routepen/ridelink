module.exports = function(recipientName, driversName, itemChanged){
	return 'Hi ' + recipientName + ',\n\n'+
		'We\'re here to let you know that ' + driversName + ' changed the ' + itemChanged + ' to his ride. Just thought we\'d keep you posted!\n\n'+
		'You can view the updated route here\n\n'+
		'If you\'re not interested anymore, click here and you can remove yourself from the list.\n\n' +
		'Best,\n'+
		'Routepen Team';
};
