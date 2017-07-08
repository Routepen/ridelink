module.exports = function(app, User) {

  app.post('/test/createUser', function(req, res) {
    var newUser = new User(req.body.user);

    newUser.save(function(err) {
      if (err) { return res.status(500).send({err: err.toString()}); }
      res.json(newUser);
    });
  });

}
