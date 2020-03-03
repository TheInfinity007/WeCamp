var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");

//root route
router.get('/', (req, res)=>{
	res.render("landing");
});

//show register form
router.get("/register", (req, res)=>{
	res.render("register");
});

//handle sign up logic
router.post("/register", (req, res)=>{
	var username = req.body.username;
	var password = req.body.password;
	var newUser = new User({username: username});
	User.register(newUser, password, (err, user)=>{
		if(err){
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("/register");
		}else{
			passport.authenticate("local")(req, res, ()=>{
				req.flash("success", "Welcome to Yelpcamp " + user.username);
				res.redirect("/campgrounds");
			});
		}
	});
});

//show login form
router.get("/login", (req, res)=>{
	res.render("login");
});

//handle login logic
router.post("/login", passport.authenticate("local", 
	{
		successRedirect: "/campgrounds",
		failureRedirect: "/login"
	}) , (req, res)=>{
});

//logout route
router.get("/logout", (req, res)=>{
	req.logout();
	req.flash("success", "Logged You out");
	res.redirect("/campgrounds");
});


module.exports = router;