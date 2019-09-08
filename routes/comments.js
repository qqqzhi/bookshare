var express    = require("express")
var router = express.Router();
var Campground = require("./../models/book")
var Comment = require("./../models/comment")

//NEW
router.get("/books/:id/comments/new", isLoggedIn, function(req, res) {
	//res.send("comments")
	Campground.findById(req.params.id, function(err, book) {
		if(err){
			console.log(err);
		}else{
			res.render("comments/new.ejs", {book : book});
		}
	})
})

//CREATE
router.post("/books/:id/comments", isLoggedIn, function(req, res) {
	Campground.findById(req.params.id, function(err, book) {
		if(err){
			console.log(err);
			res.redirect("/books");
		}else{
			//console.log(req.body.comment);
			Comment.create(req.body.comment, function(err, comment) {
				if(err){
					req.flash("error", "Something is wrong when creating comment")
					console.log(err);
				}else{
					// add username and id to comment
					comment.createdBy.id = req.user._id;
					comment.createdBy.username = req.user.username
					comment.save()
					book.comments.push(comment);
					book.save();
					console.log(comment)
					req.flash("success", "Successfully added comment")
					res.redirect("/books/" + book._id);
				}
			})
		}
	})
})

//EDIT
router.get("/books/:id/comments/:comment_id/edit", checkCommentOwnership, function(req, res) {
	Comment.findById(req.params.comment_id, function(err, foundComment) {
		if(err){
			res.redirect("back")
		}else{
			res.render("comments/edit.ejs", {book_id : req.params.id, comment : foundComment})
		}
	})	
})

//UPDATE
router.put("/books/:id/comments/:comment_id", checkCommentOwnership, function(req, res) {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment,function(err, updatedComment) {
		if(err){
			res.redirect("back")
		}else{
			res.redirect("/books/" + req.params.id)
		}
	})
})

//DELETE
router.delete("/books/:id/comments/:comment_id", checkCommentOwnership, function(req, res) {
	Comment.findByIdAndRemove(req.params.comment_id, function(err) {
		if(err){
			res.redirect("back")
		}else{
			req.flash("success", "Comment deleted")
			res.redirect("/books/" + req.params.id)
		}
	})
})

function checkCommentOwnership (req, res, next) {
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment) {
			if(err){
				res.redirect("back")
			}else{
				if(foundComment.createdBy.id.equals(req.user._id)){ //这里不能用===因为一个是obj一个是str
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
