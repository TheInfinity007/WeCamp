var express = require("express");
var router = express.Router({mergeParams: true});
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");


router.get("/users", (req, res)=>{
	res.redirect("back");
});

/*USERS - SHOW ROUTE*/
router.get("/users/:user_id", (req, res)=>{
	User.findById(req.params.user_id, (err, foundUser)=>{
		if(err || !foundUser){
			req.flash("error", "User not found.");
			return res.redirect("back");
		}
		Campground.find().where("author.id").equals(foundUser._id).exec((err, campgrounds)=>{
			if(err){
				req.flash("error", "Something went wrong.");
				return res.redirect("back");
			}
			res.render("users/show", {user: foundUser, campgrounds: campgrounds});
		});
	});
});

router.get("/users/:user_id/edit", (req, res)=>{
	User.findById(req.params.user_id, (err, foundUser)=>{
		if(err || !foundUser){
			req.flash("error", "No User found");
			return res.redirect("back");
		}
		res.render("users/edit", {user: foundUser});
	});
});


module.exports = router;