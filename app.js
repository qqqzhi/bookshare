var express    = require("express")
var app        = express()

var bodyParser    = require('body-parser'),
    mongoose      = require("mongoose"),
    passport      = require("passport"),
    LocalStrategy = require("passport-local"),
   methodOverride = require("method-override");
        
var seedDB     = require("./seeds");

var Campground = require("./models/campground"),
    Comment    = require("./models/comment"),
    User       = require("./models/user");

var commentRoutes     = require("./routes/comments"),
    campgroundsRoutes = require("./routes/campgrounds"),
          indexRoutes = require("./routes/index");


// seedDB();
mongoose.connect("mongodb://localhost:27017/yelp_camp",  {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"))

// Passport config
app.use(require("express-session")({
	secret: "lalala good secret",
	resave: false,
	saveUninitialized: false	
}));

app.use(passport.initialize());
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	next();
})

app.use(indexRoutes);
app.use(campgroundsRoutes);
app.use(commentRoutes)


app.listen(5000, function() {
	console.log("server started")
})