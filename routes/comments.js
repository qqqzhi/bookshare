var express    = require("express")
var router = express.Router();
var Campground = require("./../models/campground")
var Comment = require("./../models/comment")

//NEW
router.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res) {
	//res.send("comments")
	Campground.findById(req.params.id, function(err, campground) {
		if(err){
			console.log(err);
		}else{
			res.render("comments/new.ejs", {campground : campground});
		}
	})
})

//CREATE
router.post("/campgrounds/:id/comments", isLoggedIn, function(req, res) {
	Campground.findById(req.params.id, function(err, campground) {
		if(err){
			console.log(err);
			res.redirect("/campgrounds");
		}else{
			//console.log(req.body.comment);
			Comment.create(req.body.comment, function(err, comment) {
				if(err){
					req.flash("error", "Something is wrong when creating comment")
					console.log(err);
				}else{
					// add username and id to comment
					comment.author.id = req.user._id;
					comment.author.username = req.user.username
					comment.save()
					campground.comments.push(comment);
					campground.save();
					console.log(comment)
					req.flash("success", "Successfully added comment")
					res.redirect("/campgrounds/" + campground._id);
				}
			})
		}
	})
})

//EDIT
router.get("/campgrounds/:id/comments/:comment_id/edit", checkCommentOwnership, function(req, res) {
	Comment.findById(req.params.comment_id, function(err, foundComment) {
		if(err){
			res.redirect("back")
		}else{
			res.render("comments/edit.ejs", {campground_id:req.params.id, comment : foundComment})
		}
	})	
})

//UPDATE
router.put("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req, res) {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
		if(err){
			res.redirect("back")
		}else{
			res.redirect("/campgrounds/" + req.params.id)
		}
	})
})

//DELETE
router.delete("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req, res) {
	Comment.findByIdAndRemove(req.params.comment_id, function(err) {
		if(err){
			res.redirect("back")
		}else{
			req.flash("success", "Comment deleted")
			res.redirect("/campgrounds/" + req.params.id)
		}
	})
})

function checkCommentOwnership (req, res, next) {
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment) {
			if(err){
				res.redirect("back")
			}else{
				if(foundComment.author.id.equals(req.user._id)){ //这里不能用===因为一个是obj一个是str
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

function isLoggedIn (req, res, next) {
	if(req.isAuthenticated()){
		return next()
	}
	req.flash("error", "Your need to be logged in to do that")
	res.redirect("/login")
}


module.exports = router;
