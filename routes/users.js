var express = require("express");
var router = express.Router({mergeParams: true});
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");


router.get("/users", (req, res)=>{
	res.send("Thi is the users route");
})

/*USERS - SHOW ROUTE*/
router.get("/users/:user_id", (req, res)=>{
	User.findById(req.params.user_id, (err, foundUser)=>{
		if(err){
			req.flash("error", "Something went wrong.");
			res.redirect("/");
		}
		Campground.find().where("author.id").equals(foundUser._id).exec((err, campgrounds)=>{
			if(err){
				req.flash("error", "Something went wrong.");
				res.redirect("/");
			}
			res.render("users/show", {user: foundUser, campgrounds: campgrounds});
		});
	});
});

router.get("/users/:user_id/edit", (req, res)=>{
	res.render("users/edit");
});


module.exports = router;