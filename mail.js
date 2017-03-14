const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'pmh192@gmail.com',
        pass: 'pass'
    }
});


function sendMail(options) {

  var subject = "", text = "";


  if (options.notifyRider) {
    if (options.notifyRider.confirmed) {
      // TODO add oneclick payment button
      subject = text = "You've been confirmed";
    }
    if (options.notifyRider.infoChanged) {
      // TODO link to view to see changes
      var dirversName = options.driver.facebook.name.split(' ')[0];
      subject = text = (driversName + " has made some changes")
    }
    if (options.notifyRider.offWaitlist) {
      // TODO add oneclick payment button
      subject = "You've made it off the waitlist";
      text = "Congrats"
    }
    if (options.notifyRider.rideOver) {
      // TODO: Ask if ride happend and for driver ratings
      subject = "You've made it off the waitlist";
      text = "Congrats"
    }
    if (options.notifyRider.signedUp) {
      // tell them to wait for confirmations and look for other rides
      // sign up for waitlist to be the first for our new features
      subject = text = "Thanks for signing up with Easy Drive";
    }
  }
  if (options.notifyDriver) {
    if (options.notifyDriver.riderAdded) {
      // TODO add confirm buttons
      subject = text = "A rider has joined";
    }
    if (options.notifyDriver.riderPaid) {
      // We'll send you an email once the rider is completed,
      // and you'll recieve your payment then
      subject = text = "A rider has paid";
    }
    if (options.notifyRider.rideOver) {
      //
      subject = "Thanks";
      text = "Congrats";
    }
  }

  var mailOptions = {
      from: 'pmh192@gmail.com', // sender address
      to: options.to, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      //html: html // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log('Message %s sent: %s', info.messageId, info.response);
  });
}

module.exports = {
  sendMail: sendMail,
};
