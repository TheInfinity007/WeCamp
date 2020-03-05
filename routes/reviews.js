var express 			= require("express");
var router 			= express.Router({mergeParams: true});
var Campground = require("../models/campground");
var Review			= require("../models/review");
var middleware 	= require("../middleware");



// /*NEW ROUTE*/
router.get("/new", (req, res)=>{
	//checkReviewExistence checks if a user already reviewed the campground, only one review per user is allowed.
	Campground.findById(req.params.id, (err, campground)=>{
		if(err){
			req.flash("error", err.message);
			return res.redirect("back");
		}else{
			console.log(req.params.id);
			console.log(campground);
			res.render("reviews/new", {campground: campground});
		}
	});
});

module.exports = router;
