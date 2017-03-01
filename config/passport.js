/**
 * Created by Victor on 2/27/2017.
 */
var configAuth = require('./auth');
var User = require('../models/User');

passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID,
        clientSecret: configAuth.facebookAuth.clientSecret,
        callbackURL: configAuth.facebookAuth.callbackURL,
        profileFields: configAuth.facebookAuth.profileFields
    },
    function(accessToken, refreshToken, profile, cb) {
        process.nextTick(function(){
            User.findOrCreate({ facebookId: profile.id }, function (err, user) {
                if (err)
                    return done(err);
                if (user) {
                    return done(null, user);
                } else {
                    var newUser = new User();
                    newUser.facebook.id = profile.id;
                    newUser.facebook.token = accessToken;
                    newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
                    newUser.facebook.email = (profile.emails[0].value || '').toLowerCase();
                    newUser.facebook.photos = profile.picture;
                    newUser.facebook.gender = profile.gender;
                    newUser.facebook.link = profile.link;

                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
                return cb(err, user);
            });
        });
    }
));