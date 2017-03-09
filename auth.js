const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./models/User');

module.exports = {
  setUpAuth: function(app) {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
      done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
      User.findById(id, function(err, user) {
        done(err, user);
      });
    });


    passport.use(new FacebookStrategy({
        clientID: "1122786494515943",
        clientSecret: "f6cd89a5fe00867021469477156f95a6",
        callbackURL: "http://localhost:5000/auth/facebook/callback",
        profileFields: ['id', 'first_name', 'last_name', 'photos', 'email', 'gender', 'link']
      },
      function(accessToken, refreshToken, profile, done) {
        process.nextTick(function(){
          User.findOne({ 'facebook.id': profile.id}, function (err, user) {
            if (err)
              return done(err);
            else if (user) {
              return done(null, user);
            } else {
              var newUser = new User();
              newUser.facebook.id = profile.id;
              newUser.facebook.token = accessToken;
              newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
              newUser.facebook.email = (_.get(profile, 'emails[0].value', '')).toLowerCase();
              newUser.facebook.photos = profile.photos;
              newUser.facebook.gender = profile.gender;
              newUser.facebook.link = profile.profileUrl;

              newUser.save(function(err) {
                if (err)
                  throw err;
                return done(null, newUser);
              });
            }
            return;
          });
        });
      }
    ));

    app.get('/auth/logout', function(req, res) {
      req.logout();
      res.redirect("/");
    });

    app.get('/auth/facebook', function(req,res,next){
      console.log('/auth/facebook/callback?redirect=' + encodeURIComponent(req.query.redirect));
      passport.authenticate(
        'facebook',
        {callbackURL: '/auth/facebook/callback?redirect=' + encodeURIComponent(req.query.redirect) },
        {scope:["public_profile,email"]}
      )(req,res,next);
    });

    app.get('/auth/facebook/callback/', function(req,res,next) {
      console.log('/auth/facebook/callback?redirect=' + encodeURIComponent(req.query.redirect));
      passport.authenticate(
        'facebook',
        {
          callbackURL: '/auth/facebook/callback?redirect=' + encodeURIComponent(req.query.redirect),
          successRedirect: req.query.redirect,
          failureRedirect: '/failed'
        }
      )(req,res,next);
    });
    app.get('/logout', function(req,res){

    });
  }
}
