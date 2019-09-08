require('dotenv').config();

var express    = require("express");
var app        = express();
var bodyParser = require('body-parser');
var mongoose   = require("mongoose");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var methodOverride = require("method-override");
var flash = require("connect-flash");

var seedDB     = require("./seeds");

var User       = require("./models/user");
var Campground = require("./models/campground");
var Comment    = require("./models/comment");

var commentRoutes     = require("./routes/comments");
var campgroundsRoutes = require("./routes/campgrounds");
var indexRoutes       = require("./routes/index");


//seedDB();
mongoose.connect("mongodb://localhost:27017/yelp_camp",  {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

// Passport config
app.use(require("express-session")({
	secret: "lalala good secret",
	resave: false,
	saveUninitialized: false	
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
  	res.locals.error = req.flash("error");
  	res.locals.success = req.flash("success");
	next();
});

app.use(indexRoutes);
app.use(campgroundsRoutes);
app.use(commentRoutes);


app.listen(5000, function() {
	console.log("server started")
});
