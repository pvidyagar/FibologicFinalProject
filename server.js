var express = require('express');
var app = express();
var port = process.env.PORT || 3000;

var passport = require('passport');
var flash = require('connect-flash');
var cloudinary = require('cloudinary');
var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var path = require('path');
var fs = require("fs");
var logger = require('./server/Utils/logger').logger;

// configuration ===============================================================


require('./server/config/cloudinary')(cloudinary); // pass cloudinary for configuration

require('./server/config/passport')(passport, app); // pass passport for configuration

app.set('views', path.join(__dirname, '/client/views'));
app.use('/bower', express.static(__dirname + '/bower_components'));
app.use('/assets', express.static(__dirname + '/client/assets'));
app.use('/controllers', express.static(__dirname + '/client/controllers'));
app.use(express.static(__dirname + '/client/views'));
app.engine('html', require('ejs').__express);
app.set('view engine', 'html');
// console.log("-----"+__dirname);

// set up our express application
//app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser({ limit: '5mb' }));

// required for passport
app.use(session({
    secret: 'Fibologic technologies',
    resave: true,
    saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session

// routes ======================================================================
require('./server/routes/appRoutes.js')(app, passport,logger); // load our routes and pass in our app and fully configured passport

//require('./server/routes/recipeRoute.js')(app, cloudinary, fs,logger)


// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);
