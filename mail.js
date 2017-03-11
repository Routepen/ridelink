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
      subject = text = "You've been confirmed";
    }
    if (options.notifyRider.infoChanged) {
      var dirversName = options.driver.facebook.name.split(' ')[0];
      subject = text = (driversName + " has made some changes")
    }
    if (options.notifyRider.offWaitlist) {
      subject = text = "You've made it off the waitlist";
    }
  }
  if (options.notifyDriver) {
    if (options.notifyDriver.riderAdded) {
      subject = text = "A rider has joined"
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
