var express = require("express")
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended : true}));

var campgrounds = [
		{name:"yellowstone", image:"https://media.istockphoto.com/photos/rainbow-in-a-thunderstorm-picture-id876109742"},
		{name:"olympic", image:"https://media.istockphoto.com/photos/rainbow-in-a-thunderstorm-picture-id876109742"},
		{name:"wawawai", image:"https://media.istockphoto.com/photos/rainbow-in-a-thunderstorm-picture-id876109742"}
	];

app.get("/", function(req, res) {
	//res.send("server started")
	res.render("landing.ejs")
})

app.get("/campgrounds", function(req, res) {	
	res.render("campgrounds.ejs", {campgrounds : campgrounds})
})

// npm install body-parse --save
app.post("/campgrounds", function(req, res) { 
	//res.send("you hit the url");
	var name = req.body.name;
	var imageurl = req.body.image;
	var newCamp = {name : name, image : imageurl};
	campgrounds.push(newCamp);
	res.redirect("/campgrounds");
});

app.get("/campgrounds/new", function(req, res) {
	res.render("new.ejs");
});

app.listen(5000, function() {
	console.log("server started")
})