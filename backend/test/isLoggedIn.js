module.exports = function(app) {

  app.get('/test/isLoggedIn', function(req, res) {
    return res.json({loggedIn: !!req.user});
  });

}
