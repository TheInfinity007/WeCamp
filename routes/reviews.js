var express 			= require("express");
var router 			= express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Review			= require("../models/review");
var middleware 	= require("../middleware");



/* REVIEW NEW ROUTE*/
router.get("/new", (req, res)=>{
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
router.post("/", middleware.isLoggedIn, (req, res)=>{
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
			res.redirect("/campgrounds");
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
