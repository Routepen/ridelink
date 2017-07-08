const nodemailer = require('nodemailer');
const mail_templates = require('./backend/mailer_templates/mail_head.js');
const _ = require('lodash');

const transporter = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: 'EasyRideShareNoReply@gmail.com',
		pass: 'Poutea46'
	}
});

// var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function sendMail(options) {
	var subject = '', text = '', html='';


	var recipientName = _.get(options, 'recipient.facebook.name', "").split(' ')[0];
	var driversName = _.get(options, 'route.driver.facebook.name', "").split(' ')[0];
	// var date = days[options.route.date.getDay()] + ' ' + (options.route.date.getMonth() + 1) + '/' + options.route.date.getDate();
	// var time = options.route.time;

	var domain = 'routepen.com';

	if (options.notifyRider) {
		if (options.notifyRider.confirmed) {
			// TODO add oneclick payment button
			let fbLink = '<a href="' + options.route.driver.facebook.link + '">here</a>';
			subject = 'Confirmation';
			text = mail_templates.confirm_text(recipientName, driversName, fbLink);
			html = mail_templates.confirm_html(recipientName, driversName, fbLink);
		}
		if (options.notifyRider.paid) {
			subject = 'Payment Confirmation';
			text = mail_templates.paid_txt(recipientName, driversName);
			html = mail_templates.paid_html(recipientName, driversName);
		}
		if (options.notifyRider.infoChanged) {
			// TODO link to view to see changes
			var itemChanged = options.changed;
			subject = driversName + ' has made some changes';
			text = mail_templates.infoChanged_txt(recipientName, driversName, itemChanged);

			var cancelLink = '<a href="' + domain + '/route?id=' + options.route._id + '&action=cancel">here</a>';
			var hereLink = '<a href="' + domain + '/route?id=' + options.route._id + '">here</a>';

			html = mail_templates.infoChanged_html(recipientName, driversName, itemChanged, cancelLink, hereLink);
		}
		if (options.notifyRider.releventRouteAdded) {
			// TODO add oneclick payment button
			subject = 'A route has been added';
			text = mail_templates.relevantRouteAdded_txt(recipientName, driversName);

			html = mail_templates.relevantRouteAdded_html(recipientName, driversName);
		}
		if (options.notifyRider.onWaitlist) {
			// TODO add oneclick payment button
			subject = 'You\'ve made it off the waitlist';
			text = mail_templates.onWaitlist_txt(recipientName, driversName);

			html = mail_templates.onWaitlist_html(recipientName, driversName);
		}
		if (options.notifyRider.offWaitlist) {

			let fbLink = '<a href="' + options.route.driver.facebook.link + '">here</a>';

			text = mail_templates.offWaitlist_txt(recipientName, driversName);

			html = mail_templates.offWaitlist_html(recipientName, driversName, fbLink);
		}
		if (options.notifyRider.rideOver) {
			// TODO: Ask if ride happend and for driver ratings
			subject = 'You\'ve made it off the waitlist';
		}
		if (options.notifyRider.signedUp) {
			subject = 'Thanks for signing up with RoutePen';
			text = mail_templates.signedUp_txt(recipientName, driversName);

			var signUpLink = '<a href="' + domain + '/newfeatures">join the waitlist</a>';

			html = mail_templates.signedUp_html(recipientName, driversName, signUpLink);
		}
		if (options.notifyRider.shouldBePickedUp) {
			subject = 'Time to Ride';
			text = mail_templates.shouldBePickedUp_txt(recipientName, driversName);
		}
		if (options.notifyRider.joinedFeatureWaitlist) {
			subject = 'RoutePen\'s Waitlist for New Features';
			text = mail_templates.joinedFeatureWaitlist_txt(recipientName, driversName);
		}
	} // end notify Rider
	if (options.notifyDriver) {
		if (options.notifyDriver.riderAdded) {
			let riderName = _.get(options, 'rider.facebook.name', "").split(' ')[0];
			// TODO add confirm buttons
			subject = 'A rider has joined';

			var here = '<a href="' + domain + '/route?id=' + options.route._id + '&action=confirm&riderId='+options.rider._id + '">here</a>';

			text = mail_templates.notifyDriverRiderAdded_txt(driversName, riderName);

			html = mail_templates.notifyDriverRiderAdded_html(driversName, riderName, here);
		}
		if (options.notifyDriver.riderPaid) {
			let riderName = _.get(options, 'rider.facebook.name', "").split(' ')[0];
			// We'll send you an email once the rider is completed,
			// and you'll recieve your payment then
			subject = text = 'A rider has paid';
			text = mail_templates.notifyDriverRiderPaid_txt(driversName, riderName);

			let fbLink = '<a href="' + options.rider.facebook.link + '">here</a>';

			html = mail_templates.notifyDriverRiderPaid_html(driversName, riderName, fbLink);
		}
		if (options.notifyDriver.shouldBePickingUp) {
			//
			subject = 'Thanks';
			text = mail_templates.shouldBePickingUp_txt(driversName);
		}
		if (options.notifyDriver.routeCreated) {
			subject = 'Route Created';
			var herelink = '<a href="' + domain + '/route?id=' + options.route._id + '">' +  domain + '/route?id=' + options.route._id + '</a>';
			text = mail_templates.notifyDriverRouteCreated_txt(herelink);

			html = mail_templates.notifyDriverRouteCreated_html(herelink);
		}
	}

	var mailOptions = {
		from: 'pmh192@gmail.com', // sender address
		to: options.recipient.confirmedEmail, // list of receivers
		subject: subject, // Subject line
		text: text, // plain text body
		html: html // html body
	};

	transporter.sendMail(mailOptions, (error, info) => {
		if (error) {
			return console.log(error);
		}
		console.log('Message %s sent: %s to %s', info.messageId, info.response, options.recipient.confirmedEmail);
	});
}

module.exports = {
	sendMail: sendMail
};
