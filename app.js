var express    = require("express"),
    app        = express(),
    bodyParser = require('body-parser'),
    mongoose   = require("mongoose"),
    Campground = require("./models/campground"),
    Comment    = require("./models/comment"),
    seedDB     = require("./seeds");
var passport = require("passport")
var LocalStrategy = require("passport-local")
var User = require("./models/user")

//seedDB();
mongoose.connect("mongodb://localhost:27017/yelp_camp",  {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static(__dirname + "/public"));

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



//========================================
// ROUTE
//========================================

app.get("/", function(req, res) {
	//res.send("server started")
	//res.render("landing.ejs")
	res.redirect("/campgrounds");
})

// INDEX route, show all campgrounds
app.get("/campgrounds", function(req, res) {	
	//res.render("campgrounds.ejs", {campgrounds : campgrounds})
	console.log(req.user)
	Campground.find({}, function(err, allcampgrounds) { //从数据库中找所有，返给allcompgrounds, 然后传给campgrounds页面显示出来
		if (err){
			console.log(err);
		}else{
			res.render("campgrounds/index.ejs", {campgrounds : allcampgrounds, currentUser:req.user})
		}
	});
});

// CREATE route, create a campground
app.post("/campgrounds", function(req, res) { 
	//res.send("you hit the url");
	var name = req.body.name;
	var imageurl = req.body.image;
	var desc = req.body.description;
	var newCamp = {name : name, image : imageurl, description : desc};
	//campgrounds.push(newCamp); Now should save to db not the list of campgrounds
	Campground.create(newCamp, function(err, newlyCreated) {
		if(err){
			console.log(err);
		}else{
			res.redirect("/campgrounds");
		}
	});	
});

// NEW route, display forms to make a new campground
app.get("/campgrounds/new", function(req, res) {
	res.render("campgrounds/new.ejs");
});

// SHOW
app.get("/campgrounds/:id", function(req, res) {
	// Find the camp with id, render show template with it
	Campground.findById(req.params.id).populate("comments").exec( function(err, foundCampgroud) {
		if(err){
			console.log(err);
		}else{
			console.log(foundCampgroud);
			res.render("campgrounds/show.ejs", {campground : foundCampgroud});
		}
	});	
});


app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res) {
	//res.send("comments")
	Campground.findById(req.params.id, function(err, campground) {
		if(err){
			console.log(err);
		}else{
			res.render("comments/new.ejs", {campground : campground});
		}
	})
})

app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res) {
	Campground.findById(req.params.id, function(err, campground) {
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		}else{
			//console.log(req.body.comment);
			Comment.create(req.body.comment, function(err, comment) {
				if(err){
					console.log(err);
				}else{
					campground.comments.push(comment);
					campground.save();
					res.redirect("/campgrounds/" + campground._id);
				}
			})
		}
	})
})

// ==========
// AUTH ROUTE
// ==========
app.get("/register", function(req, res) {
	res.render("register.ejs")
})

app.post("/register", function(req, res) {
	//res.send("Signing up")
	var newUser = new User({username:req.body.username})
	User.register(newUser, req.body.password, function(err, user) {
		if(err){
			console.log(err)
			return res.render("register.ejs")
		}else{
			passport.authenticate("local")(req, res, function() {
				res.redirect("/campgrounds")
			})
		}
	})
})

app.get("/login", function(req, res) {
	res.render("login.ejs")
})

//app.post("/login", middleware, callback)
app.post("/login", passport.authenticate("local", {
			successRedirect:"/campgrounds",
			failureRedirect:"/login"
		}), function(req, res) {
			//res.send("Logining in...")
		});

app.get("/logout", function(req, res) {
	req.logout();
	res.redirect("/campgrounds");
})

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next()
	}
	res.redirect("/login")
}


app.listen(5000, function() {
	console.log("server started")
})
