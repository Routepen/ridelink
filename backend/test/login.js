module.exports = function(app, User) {

  app.get('/test/login', function(req, res) {
    User.findById(req.query.id, function(err, user) {
      if (err) { return res.status(500).send({err: err.toString()}); }
      if (!user) { return res.status(404).send("user with id " + req.body.id + " not found") }

      req.login(user, function(err) {
        if (err) { return res.status(500).send({err: err.toString()}); }
        res.redirect("/")
      });
    });
  });

}
