var User = require('../models/User');

passport.use(new FacebookStrategy({
        clientID: process.env.FB_AUTH_CLIENT_ID,
        clientSecret: process.env.FB_AUTH_CLIENT_SECRET,
        callbackURL: process.env.FB_AUTH_CALLBACK_URL,
        profileFields: ['id', 'first_name', 'last_name', 'photos', 'email', 'gender', 'link', 'token_for_business']
    },
    function(accessToken, refreshToken, profile, cb) {
        process.nextTick(function(){
            User.findOrCreate({ facebookId: profile.id }, function (err, user) {
                if (err) { return cb(err); }
                if (user) {
                    return cb(null, user);
                } else {
                    var newUser = new User({
                      facebook: {
                        id: profile.id,
                        token: accessToken,
                        name: profile.name.givenName + ' ' + profile.name.familyName,
                        photos: (profile.emails[0].value || '').toLowerCase(),
                        picture: profile.picture,
                        gender: profile.gender,
                        link: profile.link
                      }
                    });

                    newUser.save(function(err) {
                        if (err){
                          console.log(err);
                          // TODO Better error handling
                        }
                        return cb(null, newUser);
                    });
                }
                return cb(err, user);
            });
        });
    }
));
