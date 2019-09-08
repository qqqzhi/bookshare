var express    = require("express");
var router = express.Router();
var Campground = require("./../models/campground");


var NodeGeocoder = require("node-geocoder");
var options = {
	provider: 'google',
	// Optional depending on the providers
	httpAdapter: 'https', // Default
	apiKey: process.env.GEOCODER_API_KEY, // for Mapquest, OpenCage, Google Premier
	formatter: null         // 'gpx', 'string', ...
};
var geocoder = NodeGeocoder(options);


// INDEX route, show all campgrounds
router.get("/campgrounds", function(req, res) {
	//res.render("campgrounds.ejs", {campgrounds : campgrounds})
	//console.log(req.user);
	Campground.find({}, function(err, allcampgrounds) { //从数据库中找所有，返给allcompgrounds, 然后传给campgrounds页面显示出来
		if (err){
			console.log(err);
		}else{
			res.render("campgrounds/index.ejs", {campgrounds : allcampgrounds, currentUser:req.user})
		}
	});
});

// CREATE route, create a campground
router.post("/campgrounds", isLoggedIn, function(req, res) {
	var name = req.body.name;
	var imageurl = req.body.image;
	var desc = req.body.description;
	var price = req.body.price;
	var author = {
		id : req.user._id,
		username : req.user.username
	};
	geocoder.geocode(req.body.location, function (err, results) {
		if (err || !results.length) {
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		var lat = results[0].latitude;
		var lng = results[0].longitude;
		var location = results[0].formattedAddress;

		var newCamp = {name : name, image : imageurl, description : desc, price: price, author : author, location : location, lat : lat, lng : lng};
		Campground.create(newCamp, function(err, newlyCreated) {
			if(err){
				console.log(err);
			}else{
				//console.log(newlyCreated);
				res.redirect("/campgrounds");
			}
		})
	});
});

// NEW route, display forms to make a new campground
router.get("/campgrounds/new", isLoggedIn, function(req, res) {
	res.render("campgrounds/new.ejs");
});

// SHOW
router.get("/campgrounds/:id", function(req, res) {
	Campground.findById(req.params.id).populate("comments").exec( function(err, foundCampground) {
		if(err){
			console.log(err);
		}else{
			res.render("campgrounds/show.ejs", {campground : foundCampground});
		}
	});	
});

// EDIT 
router.get("/campgrounds/:id/edit", checkCampgroundOwnership, function(req, res) {
	Campground.findById(req.params.id, function(err, foundCampground) {
		res.render("campgrounds/edit.ejs", {campground : foundCampground})
	})
})

// UPDATE
router.put("/campgrounds/:id", checkCampgroundOwnership, function(req, res){
	geocoder.geocode(req.body.location, function (err, data) {
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		//console.log("data:\n", data);
		var lat = data[0].latitude;
		var lng = data[0].longitude;
		var location = data[0].formattedAddress;
		var newCamp = {name: req.body.name, image: req.body.image, price: req.body.price, description: req.body.description, location: location, lat: lat, lng: lng};
		//console.log("newCamp\n", newCamp);
		//console.log("req.params.id\n",req.params.id);
		Campground.findByIdAndUpdate(req.params.id, {$set: newCamp}, function(err, campground){
			if(err){
				req.flash("error", err.message);
				res.redirect("back");
			} else {
				req.flash("success","Successfully Updated!");
				res.redirect("/campgrounds/" + campground._id);
			}
		});
	});
});



// DELETE
router.delete("/campgrounds/:id", checkCampgroundOwnership, function(req, res) {
	Campground.findByIdAndRemove(req.params.id, function(err) {
		if(err){
			res.redirect("/campgrounds")
		}else{
			res.redirect("/campgrounds")
		}
	})
})

function checkCampgroundOwnership(req, res, next) {
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCampground) {
			if(err){
				req.flash("error", "Campground not found")
				res.redirect("back")
			}else{
				if(foundCampground.author.id.equals(req.user._id)){ //这里不能用===因为一个是obj一个是str
					//res.render("campgrounds/edit.ejs", {campground : foundCampground})
					next()
				} else {
					req.flash("error", "You don't have permission to do that")
					res.redirect("back")
				}
			}
		})
	} else {
		req.flash("error", "Your need to be logged in to do that")
		res.redirect("back")
	}
}

function isLoggedIn(req, res, next) {
	if(req.isAuthenticated()){
		return next()
	}
	req.flash("error", "Your need to be logged in to do that")
	res.redirect("/login")
}

module.exports = router;
