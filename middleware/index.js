var Campground = require("./../models/campground")
var Comment = require("./../models/comment")
var middlewareObj = {}

middlewareObj.checkCampgroundOwnership = function (req, res, next) {
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCampground) {
			if(err){
				res.redirect("back")
			}else{
				if(foundCampground.author.id.equals(req.user._id)){ //这里不能用===因为一个是obj一个是str
					//res.render("campgrounds/edit.ejs", {campground : foundCampground})
					next()
				} else {
					res.redirect("back")
				}
			}
		})
	} else {
		res.redirect("back")
	}
}

middlewareObj.checkCommentOwnership = function (req, res, next) {
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment) {
			if(err){
				res.redirect("back")
			}else{
				if(foundComment.author.id.equals(req.user._id)){ //这里不能用===因为一个是obj一个是str
					next()
				} else {
					res.redirect("back")
				}
			}
		})
	} else {
		res.redirect("back")
	}
}

middlewareObj.isLoggedIn = function (req, res, next) {
	if(req.isAuthenticated()){
		return next()
	}
	res.redirect("/login")
}


module.exports = middlewareObj