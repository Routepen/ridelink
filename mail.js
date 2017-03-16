const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'EasyRideShareNoReply@gmail.com',
        pass: 'Poutea46'
    }
});

var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function sendMail(options) {

  var subject = "", text = "";


  var recipientName = options.recipient.facebook.name.split(' ')[0];
  var driversName = options.route.driver.facebook.name.split(' ')[0];
  var date = days[options.route.date.getDay()] + " " + (options.route.date.getMonth() + 1) + "/" + options.route.date.getDate();
  var time = options.route.time;



  if (options.notifyRider) {
    console.log("notify)");
    if (options.notifyRider.confirmed) {
      // TODO add oneclick payment button

      subject = "You've been confirmed";
      text = "Hi " + recipientName + ",\n\n"+
      "Awesome! Congrats, " + driversName + " wants to take you on a ride " + date + " at " + time + ". Message him for pickup location details. --- (depends if initial deposit is necessary) There's limited spots, so be sure to confirm quickly by putting up an initial deposit! You have <b> 28 hours </b> to secure your spot before someone else on the waitlist deserves it. Click here to secure your spot.\n\n"+
      "Also don't worry, we're not going to take your money and run :) You'll get a full refund if the driver doesn't actually show up. After the ride is over, we'll send you an email asking if " + driversName + " actually showed up.\n\n"+
      "It's important to cancel here if you have decided not to go with him! It's only fair to the poor souls on the waitlist :)\n\n"+
      "Best,\n"+
      "Routepen Team";
    }
    if (options.notifyRider.paid) {
      subject = "Payment Confirmation";
      text = "Hi " + recipientName + ",\n\n"+
      "Congrats on fully confirming the ride with " + driversName + ". We'll shoot you a final email the day of the ride and if the driver didn't actually show up, you'll have the option to let us know and get a full refund!\n\n"+
      "Best,\n"+
      "Routepen Team";
    }
    if (options.notifyRider.infoChanged) {
      console.log("changed)");
      // TODO link to view to see changes
      var itemChanged = options.changed;
      subject = driversName + " has made some changes";
      text = "Hi " + recipientName + ",\n\n"+
      "We're here to let you know that " + driversName + " changed the " + itemChanged + " to his ride. Just thought we'd keep you posted!\n\n"+
      "You can view the updated route here\n\n"+
      "If you're not interested anymore, click here to tell him that you're no longer interested.\n\n" +
      "Best,\n"+
      "Routepen Team";
      console.log(subject, text);
    }
    if (options.notifyRider.onWaitlist) {
      // TODO add oneclick payment button
      subject = "You've made it off the waitlist";
      text = "Hi " + recipientName + ",\n\n"+
        "You've now been added to {Driver's name}'s waitlist. We'll send you an email if you get off the waitlist, so sit tight!\n\n"+
        "Best,\n"+
        "Routepen Team";
    }
    if (options.notifyRider.offWaitlist) {
      text = "Hi " + recipientName + ",\n\n" +
      "Holy Moly you made it off the waitlist for " + driversName + "'s ride! Now all you have to do is secure your spot by putting up an initial deposit here. <b> You have 28 hours to do it before someone else on the waitlist's takes it! </b> We have to be fair to everybody :).\n\n" +
      "Also, it's important to cancel here if you have decided not to go with him! It's only fair to the poor souls waiting on the waitlist.\n\n" +
      "Best\n" +
      "Routepen Team";
    }
    if (options.notifyRider.rideOver) {
      // TODO: Ask if ride happend and for driver ratings
      subject = "You've made it off the waitlist";
    }
    if (options.notifyRider.signedUp) {
      subject = "Thanks for signing up with RoutePen";
      text = "Hi " + recipientName + "," +
        "Welcome to Routepen! HTML smirk with sunglasses emoji\n\n" +
        "Congrats on signing up with " + driversName + "'s ride through Routepen! We'll give you another follow up email once " + driversName + " has confirmed you as a passenger they want to take. We'll also keep you posted on any change of plans for you!\n\n" +
        "<b> New Rider Feature </b>\n\n" +
        "If you find yourself having a hard time finding rides, we're rolling out a new Instant notifications feature. We give you a notification every time there is a ride on the way or to where you're trying to go. If you find yourself having a tough time finding rides, join the waitlist and you'll be the first to know about it. We only have 300 spots, so sign up quick!\n\n" +
        "In the meantime, find other drivers through the Facebook Groups (Bay Area, SoCal, and the Regular). Pin your dropoff location. And let us handle the rest for you! :)\n\n" +
        "Best,\n" +
        "Routepen Team";
    }
    if (options.notifyRider.shouldBePickedUp) {
      subject = "Time to Ride";
      text = "Hi " + recipientName + ",\n\n"+
      "Hope you enjoyed your ride with " + driversName + ".\n\n"+
      "<b> If your drive went smoothly ignore the rest of the email </b> and be sure to let us know at admin@routepen.com if you'd like to let us know about your experience.\n\n"+
      "If the driver didn't actually show up, click here and we'll look into giving you a refund in the next 3-5 days.\n\n"+
      "<b> Before you click on the link to confirm the driver didn't show up </b>, we'd just like to go over some things. We take honesty here at Routepen seriously, so any false allegations will lead to a ban on the website. We hope to keep this community as high quality as possible :)\n\n"+
      "Best,\n"+
      "Routepen Team";
    }
    if (options.notifyRider.joinedFeatureWaitlist) {
      subject = "RoutePen's Waitlist for New Features";
      text = "Hi " + recipientName + ",\n\n" +
      "Glad you'd like to hear about the new feature! We'll follow up with you once we roll out this new feature for you :). Happy Ridefinding!\n\n" +
      "Best,\n" +
      "Routepen team";
    }
  }
  if (options.notifyDriver) {
    if (options.notifyDriver.riderAdded) {
      var riderName = options.rider.facebook.name.split(' ')[0];
      // TODO add confirm buttons
      subject = "A rider has joined";
      text = "Hi " + driversName + ",\n\n" +
      "Congrats! " + riderName + " is interested in taking a ride from you! Take a look at his dropoff location here and confirm him if you'd like to take him. He'll get a follow up email about details for the initial deposit.\n\n" +
      "<b> How it works: </b>\n\n" +
      "Once " + riderName + " is confirmed, we'll give him/her 28 hours to put up his initial deposit. If he doesn't get it on time, someone from the waitlist will replace his spot!\n\n" +
      "Feel free to send me an email back if you have any questions :). I'll be sure to answer them within a few hours.\n\n" +
      "Best,\n" +
      "Routepen Team";
    }
    if (options.notifyDriver.riderPaid) {
      var riderName = options.rider.facebook.name.split(' ')[0];
      // We'll send you an email once the rider is completed,
      // and you'll recieve your payment then
      subject = text = "A rider has paid";
      text = "Hi " + driversName + ",\n\n" +
      "We have some awesome news. " + riderName + " has paid his initial deposit and he's locked in for the ride. On the day of the ride, we'll send you an email confirming that you have taken him/her and you'll get your money then!\n\n" +
      "If interested, visit " + riderName + "'s Facebook profile on your map here and send him a quick message with details of the ride.\n\n" +
      "Best,\n" +
      "Routepen Team";
    }
    if (options.notifyDriver.shouldBePickingUp) {
      //
      subject = "Thanks";
      text = "Hi " + driversName + ",\n\n" +
      "Hope the ride is going well! Now's the time to let us know if you've taken the riders. Confirm here if you've picked them up and assuming no riders deny you've taken him/her in the next day, we'll send you the money through venmo. Just give it a day!\n\n" +
      "If any of the riders deny, we will look into it and give you a follow up email with details.\n\n" +
      "Otherwise if you weren't able to show up, deny here and we'll refund the riders!\n\n" +
      "Thanks for your honesty! To assure quality in this exclusive community, we unfortunately do have to take further action if caught lying, but rest assured I know you're not going to be one of them :)\n\n" +
      "Have a wonderful day and let us know your thoughts on RoutePen here if you have any questions or concerns!\n\n" +
      "Best,\n" +
      "RoutePen Team";
    }
    if (options.notifyDriver.routeCreated) {
      subject = "Route Created";
      text = "Welcome to Routepen!,\n\n"+
      "You're not apart of the team. We're here for you to help you make some serious money without worrying about last minute bailing! Now all you have to do is to post on the Fb Rideshare post with your link included. Keep in mind your route is only useful if you share it!\n\n"+
      "Then just sit back and wait for riders to enter their dropoff locations on the map and confirm the ones you like. We'll even help you by giving you an email every time a rider signs up. (Excess riders will automatically be added to the waitlist) :)\n\n"+
      "Best,\n" +
      "Routepen Team";
    }
  }

  var mailOptions = {
      from: 'pmh192@gmail.com', // sender address
      to: options.recipient.confirmedEmail, // list of receivers
      subject: subject, // Subject line
      text: text, // plain text body
      //html: html // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
          return console.log(error);
      }
      console.log(options);
      console.log('Message %s sent: %s to %s', info.messageId, info.response, options.recipient.confirmedEmail);
  });
}

module.exports = {
  sendMail: sendMail,
};
