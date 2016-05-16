var User = require('../models/user');
var uniqueValidator = require('mongoose-unique-validator');

module.exports = function(app, passport,logger) {

	// normal routes
	// ===============================================================

	app.get('/', function(req, res) {
		res.render('homeDelights', {
			user : req.user ? req.user : null
		});
	});

	app.get('/welcome', isLoggedIn, function(req, res) {
		res.render('homeDelights', {
			user : req.user
		});
	});
	
	app.get('/getChefName',function(req,res){
		var user={};
		user=req.user;
		res.send(user.name);
	});

	app.get('/logout', function(req, res) {
		
		var user = req.user;
		
		if(user!= undefined){
			console.log("************** User is undefined for logout")
			user.token = undefined;
			user.save(function(err) {
			});
		}
		req.logout();
		
		
		res.json("hello");
	});

	app.get('/fetchUserInfo', function(req, res) {
		userInfo = req.user;
		res.json(userInfo);
	});

	app.post('/updateUserInfo', function(req, res) {
		var data = req.body

		User.update({
			_id : data.id
		}, {
			$set : {
				"name" : data.name,
				"gender" : data.gender,
				"email" : data.email,
				"mobileno" : data.mobileno,
				"address" : data.address
			}
		}, function(err, doc) {
			if (err || !doc) {
				console.log(err);
			} else {
				console.log(doc);
				res.json(doc);
			}
		});
	});

	app.post('/signUpData/:role', function(req, res) {
		var userData = User({

			name : req.body.fullname,
			email : req.body.email,
			mobileno : req.body.mobilenumber,
			role : req.params.role,
			password : req.body.password,
			token : ""
		});

		userData.save(function(err, docs) {

			if (err != null) {
				res.json(true);
			} else {
				res.json(false);
			}
		});

	});
	
	app.post('/checkLogin', function(req, res) {
		var data = req.body;
		logger.info('Inside checkLogin function email='+data.email + ' password ='+data.password);
		User.findOne({email : data.email, password : data.password}, function(err, docs) {
			res.json(docs);
		});
	});
	
	// =============================================================================
	// AUTHENTICATE (FIRST LOGIN)
	// ==================================================
	// =============================================================================

	//=========================
	
	//local login-------------------------------
	
	
	app.post('/login', function(req, res, next) {
		  passport.authenticate('local', function(err, user, info) {
		    if (err) { 
		    	return next(err); 
		    }
		    
		    if (!user) {
		    	return res.redirect('/error'); 
		    }
		    
		    req.logIn(user, function(err) {
		      if (err) { 
		    	  return next(err); 
		      }
		   
		      return res.json(req.user);
		    });
		  })(req, res, next);
		});
	
	// facebook -------------------------------

	// send to facebook to do the authentication
	app.get('/auth/facebook', passport.authenticate('facebook', {
		scope : [ 'public_profile', 'email', 'user_friends' ]
	}));

	// handle the callback after facebook has authenticated the user
	app.get('/auth/facebook/callback', passport.authenticate('facebook', {
		successRedirect : '/welcome',
		failureRedirect : '/'
	}));

	// google ---------------------------------

	// send to google to do the authentication
	app.get('/auth/google', passport.authenticate('google', {
		scope : [ 'profile', 'email' ]
	}));

	// the callback after google has authenticated the user
	app.get('/auth/google/callback', passport.authenticate('google', {
		successRedirect : '/welcome',
		failureRedirect : '/'
	}));

	// =============================================================================
	// AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT)
	// =============
	// =============================================================================

	// facebook -------------------------------

	// send to facebook to do the authentication
	app.get('/auth/facebook', passport.authorize('facebook', {
		scope : [ 'public_profile', 'email', 'user_friends' ]
	}));

	// handle the callback after facebook has authorized the user
	app.get('/auth/facebook/callback', passport.authorize('facebook', {
		successRedirect : '/welcome',
		failureRedirect : '/'
	}));

	// google ---------------------------------

	// send to google to do the authentication
	app.get('/auth/google', passport.authorize('google', {
		scope : [ 'profile', 'email' ]
	}));

	// the callback after google has authorized the user
	app.get('/auth/google/callback', passport.authorize('google', {
		successRedirect : '/welcome',
		failureRedirect : '/'
	}));

	// =============================================================================
	// UNLINK ACCOUNTS
	// =============================================================
	// =============================================================================
	// used to unlink accounts. for social accounts, just remove the token
	// for local account, remove email and password
	// user account will stay active in case they want to reconnect in the
	// future

	app.get('/unlink', function(req, res) {
        var user = req.user;
        user.token = undefined;
        user.save(function(err) {
            res.redirect('/logout');
        });
    });
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
