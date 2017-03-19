const braintree = require("braintree");

var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "hj9dggqj5z5nf5xr",
  publicKey: "x23dmbp37mfcfn83",
  privateKey: "17e997e52717609ee3bb4e2fc1fa619d"
});

module.exports = {
  setUp: function (app, mail, Route) {

    app.get("/client_token", function (req, res) {
      if (!req.user) {
        return res.end("");
      }
      gateway.clientToken.generate({}, function (err, response) {
        res.send(response.clientToken);
      });
    });

    app.post("/checkout", function (req, res) {
      if (!req.user) {
        return res.end("");
      }

      Route.findById(req.body.routeId).populate("driver").exec(function (err, route) {
        if (err || !route) {
          return res.end("route not found");
        }

        var nonceFromTheClient = req.body.payment_method_nonce;
        gateway.transaction.sale({
          amount: "10",
          paymentMethodNonce: nonceFromTheClient,
          options: {
            submitForSettlement: true
          }
        }, function (err, result) {
          if (!err && result.success) {

            route.riderStatus[req.user._id.toString()].paid = true;
            route.markModified("riderStatus");
            route.save(function (err) {
              if (err) {
                return res.end(err.toString());
              }
              res.redirect('/route?id=' + (route.shortId || route.id) + "&status=paymentConfirmed");
            });

            mail.sendMail({
              recipient: req.user,
              route: route,
              notifyRider: {
                paid: true
              }
            });

            mail.sendMail({
              recipient: route.driver,
              route: route,
              rider: req.user,
              notifyDriver: {
                riderPaid: true
              }
            });
          } else {
            console.log(result, err);
            res.end("failure");
          }
        });
      });
    });
  }
};

//# sourceMappingURL=payments-compiled.js.map