var express    = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("./../models/user");


router.get("/", function(req, res) {
	res.redirect("/books");
});


router.get("/register", function(req, res) {
	res.render("register.ejs");
});

router.post("/register", function(req, res) {
	//res.send("Signing up")
	var newUser = new User({username:req.body.username});
	User.register(newUser, req.body.password, function(err, user) {
		if(err){
			req.flash("error", err.message);
			return res.render("register.ejs")
		}else{
			passport.authenticate("local")(req, res, function() {
				req.flash("success", "Welcome " + user.username);
				res.redirect("/books")
			})
		}
	})
});

router.get("/login", function(req, res) {
	//res.render("login.ejs", {message : req.flash("error")})
	res.render("login.ejs")
});

//router.post("/login", middleware, callback)
router.post("/login", passport.authenticate("local", {
			successRedirect:"/books",
			failureRedirect:"/login"
		}), function(req, res) {
			//res.send("Logining in...")
		});

router.get("/logout", function(req, res) {
	req.logout();
	req.flash("success", "You've logged out!");
	res.redirect("/books");
});

module.exports = router;

