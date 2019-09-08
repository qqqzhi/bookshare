var express    = require("express");
var router = express.Router();
var Book = require("./../models/book");


var NodeGeocoder = require("node-geocoder");
var options = {
	provider: 'google',
	// Optional depending on the providers
	httpAdapter: 'https', // Default
	apiKey: process.env.GEOCODER_API_KEY, // for Mapquest, OpenCage, Google Premier
	formatter: null         // 'gpx', 'string', ...
};
var geocoder = NodeGeocoder(options);

var publicIp = require('public-ip');
var iplocation = require("iplocation").default;


// INDEX route, show all books
router.get("/books", function(req, res) {
	Book.find({}, function(err, foundbooks) {
		if (err){
			console.log(err);
		}else{
			res.render("books/index.ejs", {books : foundbooks, currentUser:req.user})
		}
	});
});

// show books nearby
router.get("/booksnearby", function(req, res) {
	publicIp.v4()
		.then(iplocation)
		.then(function (value) {
			var lat = value.latitude;
			var lng = value.longitude;
			Book.find({
					$and:[
						{lat:{$gt:lat-0.5, $lt:lat+0.5}},
						{lng:{$gt:lng-0.5, $lt:lng+0.5}}
						]
				},
				function(err, foundbooks) {
					if (err){
						console.log(err);
					}else{
						//res.send(foundbooks);
						res.render("books/index.ejs", {books : foundbooks, currentUser:req.user})
					}
			});
		});
});

// CREATE route, create a book
router.post("/books", isLoggedIn, function(req, res) {
	var title = req.body.title;
	var imageurl = req.body.image;
	var description = req.body.description;
	var price = req.body.price;
	var author = req.body.author;
	var createdBy = {
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

		var newBook = {
			title : title,
			image : imageurl,
			description : description,
			price: price,
			author : author,
			createdBy : createdBy,
			location : location,
			lat : lat,
			lng : lng};
		Book.create(newBook, function(err, newlyCreated) {
			if(err){
				console.log(err);
			}else{
				//console.log(newlyCreated);
				res.redirect("/books");
			}
		})
	});
});

// NEW route, display forms to make a new book
router.get("/books/new", isLoggedIn, function(req, res) {
	res.render("books/new.ejs");
});

// SHOW
router.get("/books/:id", function(req, res) {
	Book.findById(req.params.id).populate("comments").exec( function(err, foundBook) {
		if(err){
			console.log(err);
		}else{
			res.render("books/show.ejs", {book : foundBook});
		}
	});	
});

// EDIT 
router.get("/books/:id/edit", checkBookOwnership, function(req, res) {
	Book.findById(req.params.id, function(err, foundBook) {
		res.render("books/edit.ejs", {book : foundBook})
	})
})

// UPDATE
router.put("/books/:id", checkBookOwnership, function(req, res){
	geocoder.geocode(req.body.location, function (err, data) {
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		//console.log("data:\n", data);
		var lat = data[0].latitude;
		var lng = data[0].longitude;
		var location = data[0].formattedAddress;
		var newBook = {
			title: req.body.title,
			author : req.body.author,
			image: req.body.image,
			price: req.body.price,
			description: req.body.description,
			location: location,
			lat: lat,
			lng: lng};
		//console.log("newBook\n", newBook);
		//console.log("req.params.id\n",req.params.id);
		Book.findByIdAndUpdate(req.params.id, {$set: newBook}, function(err, book){
			if(err){
				req.flash("error", err.message);
				res.redirect("back");
			} else {
				req.flash("success","Successfully Updated!");
				res.redirect("/books/" + book._id);
			}
		});
	});
});



// DELETE
router.delete("/books/:id", checkBookOwnership, function(req, res) {
	Book.findByIdAndRemove(req.params.id, function(err) {
		if(err){
			res.redirect("/books")
		}else{
			res.redirect("/books")
		}
	})
})

function checkBookOwnership(req, res, next) {
	if(req.isAuthenticated()){
		Book.findById(req.params.id, function(err, foundBook) {
			if(err){
				req.flash("error", "Book not found")
				res.redirect("back")
			}else{
				if(foundBook.createdBy.id.equals(req.user._id)){ //这里不能用===因为一个是obj一个是str
					//res.render("books/edit.ejs", {book : foundBook})
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
