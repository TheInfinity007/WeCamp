require("dotenv").config();

var express = require('express');
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const methodOverride = require("method-override");
const moment	= require("moment");
const Campground = require('./models/campground');
const Comment = require('./models/comment');
const User = require("./models/user");
const Notification = require("./models/notification");
const Feedback = require("./models/feedback");
const seedDB = require('./seeds.js');

//requiring routes
var commentRoutes = require("./routes/comments");
var reviewRoutes = require("./routes/reviews");
var campgroundRoutes = require("./routes/campgrounds");
var indexRoutes = require("./routes/index");
var userRoutes	 = require("./routes/users");

var url = process.env.DATABASEURL || "mongodb://localhost/yelp_camp_v12";

mongoose.set('useUnifiedTopology', true);
mongoose.set('useCreateIndex', true);
mongoose.connect(url, {useNewUrlParser: true, useFindAndModify:false});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();		//seed the database
app.locals.moment = moment;

/*PASSPORT CONFIGURATION*/
app.use(require('express-session')({
	secret: "Once again rusty wins cutest dog!",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

/*this is middleware that will run for every single route*/
app.use( async (req, res, next)=>{
	res.locals.currentUser = req.user;
	if(req.user){
		try{
			let user = await User.findById(req.user._id).populate("notifications", null, {isRead: false}).exec();
			res.locals.notifications = user.notifications.reverse();
		}catch(err){
			console.log('Error is = ' + err.message);
		}
	}
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use('/', indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);
app.use("/", userRoutes);
app.get("/*", (req, res)=>{
	res.redirect("back");
})

app.listen(process.env.PORT || 3000, ()=>{
	console.log("WeCamp Has Started");
	console.log("Server is listening at 'localhost:3000'");
});