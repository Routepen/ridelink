const braintree = require("braintree");


var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: "hj9dggqj5z5nf5xr",
  publicKey: "x23dmbp37mfcfn83",
  privateKey: "17e997e52717609ee3bb4e2fc1fa619d"
});

module.exports = {
  setUp: function(app) {
    app.get("/client_token", function (req, res) {
      gateway.clientToken.generate({}, function (err, response) {
        res.send(response.clientToken);
      });
    });

    app.post("/checkout", function (req, res) {
      var nonceFromTheClient = req.body.payment_method_nonce;
      gateway.transaction.sale({
        amount: req.body.amount,
        paymentMethodNonce: nonceFromTheClient,
        options: {
          submitForSettlement: true
        }
      }, function (err, result) {
        if (!err && result.success) {
          res.end("success");
        }
        else {
          res.end("failure");
        }
      });
    });
  }
}
