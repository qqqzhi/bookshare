var express    = require("express")
var router = express.Router()
var passport = require("passport")
var User = require("./../models/user")

router.get("/", function(req, res) {
	//res.send("server started")
	//res.render("landing.ejs")
	res.redirect("/campgrounds");
})

// ==========
// AUTH ROUTE
// ==========
router.get("/register", function(req, res) {
	res.render("register.ejs")
})

router.post("/register", function(req, res) {
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

router.get("/login", function(req, res) {
	res.render("login.ejs")
})

//router.post("/login", middleware, callback)
router.post("/login", passport.authenticate("local", {
			successRedirect:"/campgrounds",
			failureRedirect:"/login"
		}), function(req, res) {
			//res.send("Logining in...")
		});

router.get("/logout", function(req, res) {
	req.logout();
	res.redirect("/campgrounds");
})

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next()
	}
	res.redirect("/login")
}

module.exports = router;

