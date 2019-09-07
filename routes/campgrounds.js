var express    = require("express")
var router = express.Router();

var Campground = require("./../models/campground")

// INDEX route, show all campgrounds
router.get("/campgrounds", function(req, res) {	
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

// npm install body-parse --save
// CREATE route, create a campground
router.post("/campgrounds", function(req, res) { 
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
router.get("/campgrounds/new", function(req, res) {
	res.render("campgrounds/new.ejs");
});

// SHOW
router.get("/campgrounds/:id", function(req, res) {
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

module.exports = router;