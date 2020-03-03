var express = require("express");
var router = express.Router();
var Campground = require("../models/campground");
var middleware = require("../middleware");


/*INDEX ROUTE - show all campgrounds*/
router.get('/', (req, res)=>{
	/* Get all the campgrounds from the DB*/
	Campground.find({}, (err, allCampgrounds)=>{
		if(err){
			console.log(err);
		}else{
			res.render("campgrounds/index", {campgrounds: allCampgrounds, currentUser: req.user});
		}
	});
});

/*CREATE ROUTE - add new campground to database*/
router.post("/", middleware.isLoggedIn, (req, res)=>{
	//get data from form and add to campgrounds array
	console.log(req.body);
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
	Campground.findById(req.params.id).populate("comments").exec( (err, foundCampground)=>{
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
	//find and update the correct campground
	Campground.findByIdAndUpdate(req.params.id, req.body.campground, (err, updatedCampground)=>{
		if(err){
			res.redirect("/campgrounds");
		}else{
			res.redirect("/campgrounds/" + req.params.id);
		}
	})
});

//DELETE  CAMPGROUND ROUTE
router.delete("/:id", middleware.checkCampgroundOwnership, (req, res)=>{
	Campground.findByIdAndRemove(req.params.id, (err)=>{
		if(err){
			res.redirect("/campgrounds");
		}else{
			res.redirect("/campgrounds");
		}
	});
});




module.exports = router;