var express = require("express");
var router = express.Router({mergeParams: true});
var User = require("../models/user");
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review");
var Notification = require("../models/notification");
var middleware = require("../middleware");


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

/*USER EDIT ROUTE*/
router.get("/users/:user_id/edit", middleware.checkUserOwnership,  (req, res)=>{
	User.findById(req.params.user_id, (err, foundUser)=>{
		if(err || !foundUser){
			req.flash("error", "No User found");
			return res.redirect("back");
		}
		res.render("users/edit", {user: foundUser});
	});
});

/*USER UPDATE ROUTE*/
router.put("/users/:user_id", middleware.checkUserOwnership, (req, res)=>{
	User.findByIdAndUpdate(req.params.user_id, req.body.user, (err, foundUser)=>{
		if(err || !foundUser){
			req.flash("error", err.message);
			return res.redirect("back");
		}
		req.flash("Your profile has been update.");
		res.redirect("/users/"+ req.params.user_id);
	});
});

/*USER DELETE ROUTE*/
router.delete("/users/:user_id", middleware.checkUserOwnership, (req, res)=>{
	User.findById(req.params.user_id, (err, user)=>{
		if(err || !user){
			req.flash("error", "No user found");
			return res.redirect("back");
		}
		//delete all campgrounds associated with the user
		Campground.find().where("author.id").equals(user._id).exec((err, campgrounds)=>{
			if(err){
				req.flash("error", "Something went wrong");
				return res.redirect("back");
			}
			 campgrounds.forEach((campground)=>{
				 	//deletes all comments associated with the campground
				Comment.deleteMany({"_id": {$in: campground.comments}}, (err)=>{
					if(err){
						console.log(err);
						return res.redirect("back");
					}
					//deletes all the reviews associated with the campground
					Review.deleteMany({"_id": {$in: campground.reviews}}, (err)=>{
						if(err){
							console.log(err);
							res.redirect("back");
						}
						//delete the campground
						campground.deleteOne();
					});
				});
			});

			//delete all comments associated with the user
			Comment.find().where("author.id").equals(user._id).exec((err, comments)=>{
				if(err){
					req.flash("error", "Something went wrong");
					return res.redirect("back");
				}
				comments.forEach((comment)=>{
					comment.deleteOne();
				});

				//delete all review associated with the user
				Review.find().where("author.id").equals(user._id).exec((err, reviews)=>{
					if(err){
						req.flash("error", "Something went wrong");
						return res.redirect("back");
					}
					reviews.forEach((review)=>{
						review.deleteOne();
					});
					
					// req.flash("flash", "Success, " + user  + " has been deleted");
					user.deleteOne();	
					req.flash("success", "Success, User  has been deleted");
					res.redirect("/campgrounds");
				});					
			});			 
		});
	});
});


//FOLLOW ROUTE
router.get("/follow/:user_id", middleware.isLoggedIn, (req, res)=>{
	User.findById(req.params.user_id, (err, foundUser)=>{
		if(err){
			console.log(err);
			req.flash("error", err.message);
			return res.redirect("back");
		}
		foundUser.followers.push(req.user._id);
		foundUser.save();
		req.flash("success", "Successfully followed " + foundUser.username + "!");
		res.redirect("/users/" + req.params.user_id);
	});
});

router.get("/notifications", middleware.isLoggedIn, (req, res)=>{
	User.findById(req.user._id).populate({
		path: "notifications",
		options: { sort: { "id": -1}}
	}).exec((err, user)=>{
		res.render("notifications/notification", { allNotifications: user.notifications});
	});
});

router.get("/notifications/:notification_id", middleware.isLoggedIn, (req, res)=>{
	Notification.findById(req.params.notification_id, (err, notification)=>{
		if(err){
			req.flash("error", "err.message");
			res.redirect("back");
		}
		notification.isRead = true;
		notification.save();
		res.redirect(`/campgrounds/${notification.campgroundId}`);
	});
});



module.exports = router;