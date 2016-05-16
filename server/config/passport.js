// load all the things we need
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var LocalStrategy = require('passport-local').Strategy;

var userRole = "";

// load up the user model
var User = require('../models/user');

// load the auth variables
var configAuth = require('./auth'); // use this one for testing

module.exports = function(passport, app,logger) {

    app.post('/userRole:role', function(req, res) {
        userRole = req.params.role;
    });

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });
    
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(new LocalStrategy(
    		{
    	        usernameField: 'email',
    	        passwordField: 'password'
    	       
    	    },
    		function(username, password, done) {
    	    	  
    	    	  User.findOne({ 'email': username }, function (err, user) {
    		      if (err) {
    		    	  logger.error('Error in DB connection');
    		    	  return done(err);
    		    	  }
    		      if (!user) { 
    		    	  logger.info('Invalid email address ='+username);
    		    	  return done(null, false ); }
    		      if (user.password!= password) {
    		    	  logger.info('Invalid password ='+password);
    		    	  return done(null, false ); }
    		     
    		      return done(null, user);
    		    });
    		  }
    		));


    // =========================================================================
    // FACEBOOK ================================================================
    // =========================================================================
    passport.use(new FacebookStrategy({

            clientID: configAuth.facebookAuth.clientID,
            clientSecret: configAuth.facebookAuth.clientSecret,
            callbackURL: configAuth.facebookAuth.callbackURL,
            passReqToCallback: true, // allows us to pass in the req from our route (lets us check if a user is logged in or not)
            profileFields: ["id", "emails", "first_name", "last_name", "gender", "friends", "picture.type(large)"],
            enableProof: true
        },
        function(req, token, refreshToken, profile, done) {

            // var username = profile._json.name.split(' ').join(' ');

            // asynchronous
            process.nextTick(function() {

                //                console.log(profile);

                // check if the user is already logged in
                if (!req.user) {
                    //User is not logged in
                    User.findOne({ 'email': (profile.emails) ? profile.emails[0].value : '' }, function(err, user) {

                        if (err)
                            return done(err);
                        //If we have user registered 
                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.token) {

                                User.findOneAndUpdate({ 'email': (profile.emails) ? profile.emails[0].value : '' }, {
                                        'provider': profile.provider,
                                        'profileId': profile.id,
                                        'token': token,
                                        'name': profile.name.givenName + ' ' + profile.name.familyName,
                                        'gender': profile.gender,
                                        'photo': (profile.photos) ? profile.photos[0].value : '',
                                        'role': userRole
                                    }, { upsert: true },
                                    function(err) {
                                        if (err)
                                            throw err;
                                    });
                            }

                            return done(null, user); // user found, return that user
                        } else {
                            // if there is no user, create them
                            var newUser = new User();

                            newUser.provider = profile.provider;
                            newUser.profileId = profile.id;
                            newUser.token = token;
                            newUser.name = profile.name.givenName + ' ' + profile.name.familyName;
                            newUser.email = (profile.emails) ? profile.emails[0].value : '';
                            newUser.gender = profile.gender;
                            newUser.photo = (profile.photos) ? profile.photos[0].value : '';
                            newUser.role = userRole;
                            newUser.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session
                    user.provider = profile.provider;
                    user.profileId = profile.id;
                    user.token = token;
                    user.name = profile.name.givenName + ' ' + profile.name.familyName;
                    user.email = (profile.emails) ? profile.emails[0].value : '';
                    user.gender = profile.gender;
                    user.photo = (profile.photos) ? profile.photos[0].value : '';
                    user.role = userRole;
                    user.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                }
            });

        }));


    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    passport.use(new GoogleStrategy({

            clientID: configAuth.googleAuth.clientID,
            clientSecret: configAuth.googleAuth.clientSecret,
            callbackURL: configAuth.googleAuth.callbackURL,
            passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)

        },
        function(req, token, refreshToken, profile, done) {

            // asynchronous
            process.nextTick(function() {

                //                console.log(profile);

                // check if the user is already logged in
                if (!req.user) {

                    User.findOne({ 'email': profile.emails[0].value }, function(err, user) {
                        if (err)
                            return done(err);

                        if (user) {

                            // if there is a user id already but no token (user was linked at one point and then removed)
                            if (!user.token) {
                                User.findOneAndUpdate({ 'email': profile.emails[0].value }, {
                                        'provider': profile.provider,
                                        'profileId': profile.id,
                                        'token': token,
                                        'name': profile.displayName,
                                        'gender': profile.gender,
                                        'photo': (profile.photos) ? profile.photos[0].value : '',
                                        'role': userRole
                                    }, { upsert: true },
                                    function(err) {
                                        if (err)
                                            throw err;
                                    });
                            };

                            return done(null, user);
                        } else {
                            var newUser = new User();
                            newUser.provider = profile.provider;
                            newUser.profileId = profile.id;
                            newUser.token = token;
                            newUser.name = profile.displayName;
                            newUser.email = profile.emails[0].value; // pull the first email
                            newUser.gender = profile.gender;
                            newUser.photo = (profile.photos) ? profile.photos[0].value : '';
                            newUser.role = userRole;
                            newUser.save(function(err) {
                                if (err)
                                    throw err;
                                return done(null, newUser);
                            });
                        }
                    });

                } else {
                    // user already exists and is logged in, we have to link accounts
                    var user = req.user; // pull the user out of the session
                    user.provider = profile.provider;
                    user.profileId = profile.id;
                    user.token = token;
                    user.name = profile.displayName;
                    user.email = profile.emails[0].value; // pull the first email
                    user.gender = profile.gender;
                    user.photo = (profile.photos) ? profile.photos[0].value : '';
                    user.role = userRole;
                    user.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, user);
                    });
                }
            });
        }));
};
