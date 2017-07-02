module.exports = function(app) {

  app.get('/test/isLoggedIn', function(req, res) {
    console.log("req.user", req.user);
    return res.json({loggedIn: !!req.user});
  });

}
