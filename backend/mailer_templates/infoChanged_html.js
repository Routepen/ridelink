module.exports = function(recipientName, driversName, itemChanged, cancelLink, hereLink){
	return '<span>Hi ' + recipientName + ',</span><br/><br/>'+
		'<span>We\'re here to let you know that ' + driversName + ' changed the ' + itemChanged + ' to his ride. Just thought we\'d keep you posted!</span><br/><br/>'+
		'<span>You can view the updated route ' + hereLink + '</span><br/><br/>'+
		'<span>If you\'re not interested anymore, click ' + cancelLink + ' to tell them that you\'re no longer interested.</span><br/><br/>' +
		'<span>Best,</span><br/>'+
		'<span>Routepen Team</span>';
};
