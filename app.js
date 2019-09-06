var express    = require("express"),
    app        = express(),
    bodyParser = require('body-parser'),
    mongoose   = require("mongoose")

mongoose.connect("mongodb://localhost:27017/yelp_camp",  {useNewUrlParser: true});
app.use(bodyParser.urlencoded({extended : true}));

// var campgrounds = [
// 		{name:"yellowstone", image:"https://media.istockphoto.com/photos/rainbow-in-a-thunderstorm-picture-id876109742"},
// 		{name:"olympic", image:"https://media.istockphoto.com/photos/rainbow-in-a-thunderstorm-picture-id876109742"},
// 		{name:"wawawai", image:"https://media.istockphoto.com/photos/rainbow-in-a-thunderstorm-picture-id876109742"}
// 	];


//SCHEMA

var campgroundSchema = new mongoose.Schema({
	name : String,
	image : String,
	description: String
});

var Campground = mongoose.model("Campground", campgroundSchema);

var db = mongoose.connection;
db.dropCollection("campgrounds", function(err, result){
	if(err){
		console.log("error delete collection Campground")
	}else{
		console.log("successfully deleted collection Campground")
	}
})

Campground.create(
	{
		name:"olympic",
		image:"https://media.istockphoto.com/photos/rainbow-in-a-thunderstorm-picture-id876109742",
		description: "good place to go"
	}, function (err, campground) {
		if(err){
			console.log(err);
		}else{
			console.log("New created campground");
			console.log(campground);
		}
	}
);


app.get("/", function(req, res) {
	//res.send("server started")
	res.render("landing.ejs")
})

// INDEX route, show all campgrounds
app.get("/campgrounds", function(req, res) {	
	//res.render("campgrounds.ejs", {campgrounds : campgrounds})
	Campground.find({}, function(err, allcampgrounds) { //从数据库中找所有，返给allcompgrounds, 然后传给campgrounds页面显示出来
		if (err){
			console.log(err);
		}else{
			res.render("index.ejs", {campgrounds : allcampgrounds})
		}
	});
});

// npm install body-parser --save
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
	res.render("new.ejs");
});

// SHOW
app.get("/campgrounds/:id", function(req, res) {
	// Find the camp with id, render show template with it
	Campground.findById(req.params.id, function(err, foundCampgroud) {
		if(err){
			console.log(err);
		}else{
			res.render("show.ejs", {campground : foundCampgroud});
		}
	});	
});


app.listen(5000, function() {
	console.log("server started")
})
