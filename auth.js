const passport = require('passport');
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('./models/User');
const util = require("./backend/helpers/util")
const _ = require("lodash");

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


    passport.use('facebook', new FacebookStrategy({
        clientID: process.env.FB_AUTH_CLIENT_ID,
        clientSecret: process.env.FB_AUTH_CLIENT_SECRET,
        callbackURL: process.env.WEB_URL + "/auth/facebook/callback",
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
              console.log(profile);
              var newUser = new User({
                facebook: {
                  id: profile.id,
                  token: accessToken,
                  name: profile.name.givenName + ' ' + profile.name.familyName,
                  email: (_.get(profile, 'emails[0].value', '')).toLowerCase(),
                  photos: profile.photos,
                  gender: profile.gender,
                  link: profile.profileUrl,
                  routes: []
                }
              });

              util.newUser.couldHaveDriverlessRoutes(newUser).then(function(has) {
                newUser.save(function(err) {
                  if (err) { return done(err); } // TODO Better error handling
                  done(null, newUser, {couldHaveDriverlessRoutes:has});
                });
              }).catch(function(err) {
                done(err);
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
      passport.authenticate(
        'facebook',
        {callbackURL: '/auth/facebook/callback?redirect=' + encodeURIComponent(req.query.redirect) },
        {scope:["public_profile,email"]}
      )(req,res,next);
    });

    app.get('/auth/facebook/callback/', function(req,res,next) {
      console.log(req.url, req.user);
      passport.authenticate(
        'facebook',
        {
          callbackURL: '/auth/facebook/callback?redirect=' + encodeURIComponent(req.query.redirect),
        },
        function(err, user, message) {
          if (user) {
            req.login(user, function() {
              if (message.couldHaveDriverlessRoutes) { // there might be some driverless rotues to for this user to claim
                return res.redirect("/routes/claim&redirect=" + encodeURIComponent(req.query.redirect));
              }

              res.redirect(req.query.redirect);
            });
          }

          else {
            res.redirect("/failed");
          }

        }
      )(req,res,next);
    });
  }
}
