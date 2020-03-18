var express 			= require("express");
var router 			= express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Review			= require("../models/review");
var middleware 	= require("../middleware");


/*REVIEW  INDEX ROUTE*/
router.get("/", (req, res)=>{
	Campground.findById(req.params.id).populate({
		path: "reviews",
		options: {sort: {createdAt: -1}}	//sorting the populated reviews array to show the latest first		
	}).exec((err, campground)=>{
		if(err || !campground){
			req.flash("error", err.message);
			return res.redirect("back");
		}
		res.render("reviews/index", {campground: campground});
	});
});

/* REVIEW NEW ROUTE*/
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, (req, res)=>{
	//checkReviewExistence checks if a user already reviewed the campground, only one review per user is allowed.
	Campground.findById(req.params.id, (err, campground)=>{
		if(err){
			req.flash("error", err.message);
			return res.redirect("back");
		}else{
			res.render("reviews/new", {campground: campground});
		}
	});
});


/*REVIEW CREATE ROUTE*/
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, (req, res)=>{
	Campground.findById(req.params.id).populate("reviews").exec((err, campground)=>{
		if(err){
			req.flash("error", err.message);
			return res.redirect("back");
		}
		Review.create(req.body.review, (err, review)=>{
			if(err){
				req.flash("error", err.message);
				return res.redirect("back");
			}
			review.author.id = req.user._id;
			review.author.username = req.user.username;
			review.campground = campground;
			review.save();
			campground.reviews.push(review);
			campground.rating = calculateAverage(campground.reviews);
			campground.save();
			req.flash("success", "Your review has been successfully added.");
			res.redirect("/campgrounds/" + req.params.id);
		});
	});
});

/*REVIEW EDIT ROUTE*/
router.get("/:review_id/edit", middleware.checkReviewOwnership, (req, res)=>{
	Campground.findById(req.params.id, (err, foundCampground)=>{
		if(err || !foundCampground){
			req.flash("error", "No campground found");
			return req.redirect("back");
		}
		Review.findById(req.params.review_id, (err, foundReview)=>{
			if(err ){
				req.flash("error", err.message);
				return res.redirect("back");
			}
			res.render("reviews/edit", {campground_id: req.params.id, review: foundReview});
		});
	});
});

/*REVIEW UPDATE ROUTE*/
router.put("/:review_id", middleware.checkReviewOwnership, (req, res)=>{
	Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new:true}, (err, updatedReview)=>{
		if(err){
			req.flash("error", err.message);
			return res.redirect("back");
		}
		Campground.findById(req.params.id).populate("reviews").exec((err, campground)=>{
			if(err){
				req.flash("error", err.message);
				return res.redirect("back");
			}
			//recalculae campground average
			campground.rating = calculateAverage(campground.reviews);
			campground.save();
			req.flash("success", "Your review was successfully updated.");
			res.redirect("/campgrounds/" + campground._id);
		});
	});
});

/*REVIEW DELETE ROUTE*/
router.delete("/:review_id", middleware.checkReviewOwnership, (req, res)=>{
	Review.findByIdAndRemove(req.params.review_id, (err)=>{
		if(err){
			req.flash("error", err.message);
			return res.redirect("back");
		}
		Campground.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec((err, campground)=>{
			if(err){
				req.flash("error", err.message);
				return res.redirect("back");
			}
			//recalculate campground average
			campground.rating = calculateAverage(campground.reviews);
			campground.save();
			req.flash("sucess", "Your review was deleted successfully.");
			res.redirect("/campgrounds/" + req.params.id);	
		});
	});
});

function calculateAverage(reviews)
{
	if(reviews.length == 0)
		return 0;
	var sum = 0;
	reviews.forEach((element)=>{
		sum += element.rating;
	});
	return sum/reviews.length;
}

module.exports = router;
