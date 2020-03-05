var express 			= require("express");
var router 			= express.Router();
var Campground = require("../models/campground");
var Review			= require("../models/review");
var middleware 	= require("../middleware");



// /*NEW ROUTE*/
router.get("/new", middleware.isLoggedIn, (req, res)=>{
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

module.exports = router;
