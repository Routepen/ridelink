module.exports = function(app, mail) {
  const EmailSubscribe = require('../../models/EmailSubscribe');

  app.post('/emailsubscribe', function(req,res){
  	var subscriber = EmailSubscribe({
  		email: req.body.email
  	});

  	subscriber.save(function(err){
  		if(err) throw err;
  		return res.redirect("/");
  	});
  });

  app.get('/sendMail', function(req, res) {
    var n = req.query.n;
    if (n == "1") {
      mail.sendMail({
        notifyDriver: {
          routeCreated: true
        },
        to: 'pmh192@gmail.com'
      });
    }
    else if (n == "2") {
      mail.sendMail({
        notifyRider: {
          signedUp: true
        },
        to: 'pmh192@gmail.com'
      });
    }
    else if (n == "3") {
      mail.sendMail({
        notifyRider: {
          confirmed: true
        },
        to: 'pmh192@gmail.com'
      });
    }
    else if (n=="4") {
      mail.sendMail({
        notifyRider: {
          offWaitlist: true
        },
        to: 'pmh192@gmail.com'
      });
    }
    else if (n=="5") {
      mail.sendMail({
        notifyRider: {
          infoChanged: true
        },
        driver: {facebook:{name: "Porter Haet"} },
        to: 'pmh192@gmail.com'
      });
    }
    else if (n=="6") {
      mail.sendMail({
        notifyRider: {
          offWaitlist: true
        },
        driver: {facebook:{name: "Porter Haet"} },
        to: 'pmh192@gmail.com'
      });
    }
    else if (n=="7") {
      mail.sendMail({
        notifyRider: {
          paid: true
        },
        driver: {facebook:{name: "Porter Haet"} },
        to: 'pmh192@gmail.com'
      });
    }
    else if (n=="8") {
      mail.sendMail({
        notifyRider: {
          shouldBePickedUp: true
        },
        driver: {facebook:{name: "Porter Haet"} },
        to: 'pmh192@gmail.com'
      });
    }
    else if (n=="9") {
      mail.sendMail({
        notifyRider: {
          joinedFeatureWaitlist: true
        },
        driver: {facebook:{name: "Porter Haet"} },
        to: 'pmh192@gmail.com'
      });
    }
    else if (n=="10") {
      mail.sendMail({
        notifyDriver: {
          riderAdded: true
        },
        driver: {facebook:{name: "Porter Haet"} },
        to: 'pmh192@gmail.com'
      });
    }
    else if (n=="11") {
      mail.sendMail({
        notifyDriver: {
          riderPaid: true
        },
        driver: {facebook:{name: "Porter Haet"} },
        to: 'pmh192@gmail.com'
      });
    }
    else if (n=="12") {
      mail.sendMail({
        notifyDriver: {
          shouldBePickingUp: true
        },
        driver: {facebook:{name: "Porter Haet"} },
        to: 'pmh192@gmail.com'
      });
    }
    res.end("");
  });
}
