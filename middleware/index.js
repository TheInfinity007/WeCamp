//all the middleware goes here
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = (req, res, next)=>{
	if(req.isAuthenticated()){ 
		Campground.findById(req.params.id, (err, foundCampground)=>{
			if(err || !foundCampground){
				req.flash("error", "Campground not found");
				res.redirect("back");
			}else{
				//does user own the campground
				if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				}else{
					req.flash("error", "You are not authorized to do that!!");
					res.redirect("back");
				}
			}
		});
	}else{
		req.flash("error", "You need to be logged in to do that!!");
		  res.redirect("back");
	}
}

middlewareObj.checkCommentOwnership = (req, res, next)=>{
	//does user logged in
	if(req.isAuthenticated()){ 
		Comment.findById(req.params.comment_id, (err, foundComment)=>{
			if(err || !foundComment){
				req.flash("error", "Comment not found");
				res.redirect("back");
			}else{
				//does user own the campground
				if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				}else{
					req.flash("error", "You are not authorized to do that!!");
					res.redirect("back");
				}
			}
		});
	}else{
		req.flash("error", "You need to be logged in to do that!!");
	 	res.redirect("back");
	}
}

middlewareObj.checkReviewOwnership = (req, res, next)=>{
	//does user logged in
	if(req.isAuthenticated()){
		Review.findById(req.params.review_id, (err, foundReview)=>{
			if(err || !foundReview){
				req.flash("error", "Review not found");
				res.redirect("back");
			}else{
				//does user own the review
				if(foundReview.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				}else{
					req.flash("error", "You are not authorized to do that!!");
					res.redirect("back");
				}
			}
		})
	}else{
		req.flash("error", "You need to be logged in to do that!!");
		res.redirect("back");
	}
}

middlewareObj.checkReviewExistence = (req, res, next)=>{
	if(req.isAuthenticated()){
		Campground.findById(req.params.id).populate("reviews").exec((err, foundCampground)=>{
			if(err || ! foundCampground){
				req.flash("error", "Campground not found");
				res.redirect("back");
			}else{
				//check if req.user._id exist in foundCampground.reviews
				var foundUserReview = foundCampground.reviews.some((review)=>{
					return review.author.id.equals(req.user._id);
				});
				if(foundUserReview){
					req.flash("error", "You already wrote a review.");
					return res.redirect("/campgrounds/" + foundCampground._id);
				}
				next();
			}
		});
	}else{
		req.flash("error", "You need to login first.");
		res.redirect("back");
	}
}
middlewareObj.isLoggedIn = (req, res, next)=>{
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to be logged in to do that!!");
	res.redirect('/login');
}

module.exports = middlewareObj;