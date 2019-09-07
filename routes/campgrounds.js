var express    = require("express")
var router = express.Router();

var Campground = require("./../models/campground")
var middleware = require("./../middleware")  //因为middleware里用的是index.js，默认就是这个文件

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
router.post("/campgrounds", middleware.isLoggedIn, function(req, res) { 
	//res.send("you hit the url");
	var name = req.body.name;
	var imageurl = req.body.image;
	var desc = req.body.description;
	var author = {
		id : req.user._id,
		username : req.user.username
	}
	var newCamp = {name : name, image : imageurl, description : desc, author : author};
	//console.log(req.user)
	//campgrounds.push(newCamp); Now should save to db not the list of campgrounds
	Campground.create(newCamp, function(err, newlyCreated) {
		if(err){
			console.log(err);
		}else{
			console.log(newlyCreated);
			res.redirect("/campgrounds");
		}
	});	
});

// NEW route, display forms to make a new campground
router.get("/campgrounds/new", middleware.isLoggedIn, function(req, res) {
	res.render("campgrounds/new.ejs");
});

// SHOW
router.get("/campgrounds/:id", function(req, res) {
	// Find the camp with id, render show template with it
	Campground.findById(req.params.id).populate("comments").exec( function(err, foundCampground) {
		if(err){
			console.log(err);
		}else{
			//console.log(foundCampground);
			res.render("campgrounds/show.ejs", {campground : foundCampground});
		}
	});	
});

// EDIT 
router.get("/campgrounds/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		res.render("campgrounds/edit.ejs", {campground : foundCampground})
	})
})

// UPDATE
router.put("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground) {
		if(err){
			res.redirect("/campgrounds")
		}else{
			res.redirect("/campgrounds/" + req.params.id)
		}
	})
})

// DELETE
router.delete("/campgrounds/:id", middleware.checkCampgroundOwnership, function(req, res) {
	Campground.findByIdAndRemove(req.params.id, function(err) {
		if(err){
			res.redirect("/campgrounds")
		}else{
			res.redirect("/campgrounds")
		}
	})
})


module.exports = router;