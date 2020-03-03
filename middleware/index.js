//all the middleware goes here
var Campground = require("../models/campground");
var Comment = require("../models/comment");

var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = (req, res, next)=>{
	if(req.isAuthenticated()){ 
		Campground.findById(req.params.id, (err, foundCampground)=>{
			if(err || !foundCampground){
				req.flash("error", "Campground not found");
				res.redirect("back");
			}else{
				//does user own the campground
				if(foundCampground.author.id.equals(req.user._id)){
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
				if(foundComment.author.id.equals(req.user._id)){
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

middlewareObj.isLoggedIn = (req, res, next)=>{
	if(req.isAuthenticated()){
		return next();
	}
	req.flash("error", "You need to be logged in to do that!!");
	res.redirect('/login');
}

module.exports = middlewareObj;