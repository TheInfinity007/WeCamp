var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var middleware = require("../middleware");
var Review = require("../models/review");


/*INDEX ROUTE - show all campgrounds*/
router.get('/', (req, res)=>{
	var noMatch;
	if(req.query.search){
		const regex = new RegExp(escapeRegex(req.query.search), "gi");
		Campground.find({name: regex}, (err, allCampgrounds)=>{
			if(err){
				console.log(err);
			}else{
				if(allCampgrounds.length < 1){
					noMatch = "No campgrounds match that query, please try again.";
				}
				res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user, noMatch: noMatch});
			}
		});
	}else{
		/* Get all the campgrounds from the DB*/
		Campground.find({}, (err, allCampgrounds)=>{
			if(err){
				console.log(err);
			}else{
				res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user, noMatch: noMatch});
			}
		});
	}
});

/*CREATE ROUTE - add new campground to database*/
router.post("/", middleware.isLoggedIn, (req, res)=>{
	//get data from form and add to campgrounds array
	// console.log(req.body);
	var name = req.body.name;
	var cost = req.body.cost;
	var image = req.body.image;
	var description = req.body.description;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	var newCampground = {name: name, image: image, description: description, author: author, cost: cost};
	// console.log(req.user);
	/* Create a new campground and save to db */
	Campground.create(newCampground, (err, newlyCreated)=>{
		if(err){
			console.log(err);
		}else{
			res.redirect("/campgrounds");
		}
	});	
});

/*NEW ROUTE - show form to create campground*/
router.get("/new", middleware.isLoggedIn,  (req, res)=>{
	res.render("campgrounds/new");
});

/*SHOW ROUTE - shows more info about one campground*/
router.get("/:id", (req, res)=>{
	/* find the campground with provided ID*/
	Campground.findById(req.params.id).populate("comments").populate({
		path: "reviews",
		options: {sort:{createdAt: -1}}
	}).exec( (err, foundCampground)=>{
		if(err || !foundCampground){
			req.flash("error", "Campground not found");
			res.redirect("back");
		}else{
			//render show template with that campground
			res.render("campgrounds/show", {campground: foundCampground});
		}
	});
});

//EDIT CAMPGROUND ROUTE
router.get("/:id/edit", middleware.checkCampgroundOwnership, (req, res)=>{
	Campground.findById(req.params.id, (err, foundCampground)=>{
		res.render("campgrounds/edit", {campground: foundCampground});		
	});
});

//UPDATE CAMPGROUND ROUTE
router.put("/:id", middleware.checkCampgroundOwnership, (req, res)=>{
	delete req.body.campground.rating;
	//find and update the correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground)=>{
		if(err){
			res.redirect("/campgrounds");
		}else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	});
});

//DELETE  CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res)=>{
	Campground.findByIdAndRemove(req.params.id, (err, campground)=>{
		if(err){
			res.redirect("/campgrounds");
		}else{
			//deletes all comments associated with the campground
			Comment.deleteMany({"_id": {$in: campground.comments}}, (err)=>{
				if(err){
					console.log(err);
					return res.redirect("/campgrounds");
				}
				//deletes all the reviews associated with the campground
				Review.deleteMany({"_id": {$in: campground.reviews}}, (err)=>{
					if(err){
						console.log(err);
						res.redirect("/campgrounds");
					}
					//delete the campground
					campground.deleteOne();
					req.flash("success", "Campground deleted successfully!");
					res.redirect("/campgrounds");
				});
			});
		}
	});
});


/*FOR THE INDEX ROUTE - SEARCH FEATURE*/
function escapeRegex(text){
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
module.exports = router;