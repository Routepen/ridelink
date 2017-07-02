module.exports = function(app, User) {

  app.post('/test/deleteUser', function(req, res) {
    User.findById(req.body.id, function(err, user) {
      if (err) { return res.status(500).send({err: err.toString()}); }
      if (!user) { return res.status(404).send("user with id " + req.body.id + " not found") }

      user.remove(function(err) {
        if (err) { return res.status(500).send({err: err.toString()}); }
        res.end("");
      })
    });
  });

}
