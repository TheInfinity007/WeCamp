var express = require("express");
var router = express.Router();
var passport = require("passport");
var User = require("../models/user");
var Campground = require("../models/campground");
var async	= require("async");
var nodemailer = require("nodemailer");
var crypto = require("crypto");

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
	var password = req.body.password;
	var newUser = new User({
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
		avatar : req.body.avatar,
	});
	if(req.body.adminCode == "rcadmin"){
		newUser.isAdmin = true;
	}
	if(newUser.avatar === ""){
		newUser.avatar = "https://upload.wikimedia.org/wikipedia/commons/6/67/User_Avatar.png";
	}
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
	res.redirect("back");
});



//FORGET PASSWORD ROUTE
router.get("/forgot", (req, res)=>{
	res.render("forgot");
});

router.post("/forgot", (req, res, next)=>{
	async.waterfall([
		function(done){
			crypto.randomBytes(20, (err, buffer)=>{
				var token = buffer.toString("hex");
				done(err, token);
			});
		},
		function(token, done){
			User.find({email: req.body.email}, (err, users)=>{
				if(err){
					console.log(err);
					req.flash("error", err.message);
					return res.redirect("back");
				}
				if(users.length < 1){
					req.flash("error", "No account with that email address exists.");
					return res.redirect("/forgot");
				}
				var user = users[0];
				user.resetPasswordToken = token;
				user.resetPasswordExpires =Date.now() + 3600000;		//1hour

				user.save((err)=>{
					if(err){
						console.log(err);
						req.flash("error", err.message);
						return res.redirect("back");
					}
					done(err, token, user);
				});
			});
		},
		function(token, user, done){
			var smtpTransport = nodemailer.createTransport({
				service: "Gmail",
				auth: {
					user: process.env.GMAILID,
					pass: process.env.GMAILPW
				}
			});
			var mailOptions = {
				to: user.email,
				from: 'theinfinity674@gmail.com',
				subject: "Node.js Password Reset",
				text: "You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n" +
						"Please click on the following link, or paste this into your browser to complete the process:\n\n" + 
						"http://" + req.headers.host + "/reset/" + token + "\n\n" +
						"If you did not request this, please ignore this email and your password will remain unchanged.\n"
			};
			var info = smtpTransport.sendMail(mailOptions, (err)=>{
				console.log("mail sent");
				req.flash("success", "An e-mail has been sent to " + user.email + " with further instructions");
				done(err, "done");
			});
			
		}
	], (err)=>{
		if(err){
			return next(err);
		}
		res.redirect("/forgot");
	});
});

router.get("/reset/:token", (req, res)=>{
	User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: {$gt: Date.now()}}, (err, user)=>{
		if(!user){
			req.flash("error", "Password reset token is invalid or has expired.");
			return res.redirect("/forgot");
		}
		res.render("reset", {token: req.params.token});
	});
});

router.post("/reset/:token", (req, res)=>{
	async.waterfall([
		function(done){
			User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now()}}, (err, user)=>{
				if(!user){
					req.flash("error", "Password reset token is invalid or has expired.");
					return res.redirect("back");
				}
				if(req.body.password === req.body.confirm){
					user.setPassword(req.body.password, (err)=>{
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;

						user.save((err)=>{
							if(err){
								console.log(err);
								req.flash("error", err.message);
								return res.redirect("back");
							}
							req.login(user, (err)=>{
								if(err){
									return res.redirect("/campgrounds");
								}
								done(err, user);
							});
						});
					});
				}else{
					req.flash("error", "Passwords do not match. Try again later.");
					return res.redirect("back");
				}
			});
		},
		function(user, done){
			var smtpTransport = nodemailer.createTransport({
				service: "Gmail",
				auth: {
					user: "theinfinity674@gmail.com",
					pass: process.env.GMAILPW
				}
			});
			var mailOptions = {
				to: user.email,
				from: "theinfinity674@gmail.com",
				subject: "Your password has been changed",
				text: "Hello,\n\n" + 
						"This is a confirmation that the password for your account " + user.email + " has just changed."
			};
			smtpTransport.sendMail(mailOptions, (err)=>{
				if(err){
					console.log(err);
					req.flash("error", err.message);
					return res.redirect("/campgrounds");
				}
				console.log("mail sent2");
				req.flash("success", "Success! Your password has been changed.");
			});
			done(err, "done");
		}
	], (err)=>{
		if(err){
			console.log(err);
			console.log("Entered the error");
		}
		 res.redirect("/campgrounds");
	});
});

module.exports = router;