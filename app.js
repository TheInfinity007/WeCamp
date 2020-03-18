require("dotenv").config();
var PORT = process.env.PORT || 3000;

var express  			= require('express'),
	  app 					= express(),
	  bodyParser 		= require("body-parser"),
	  mongoose 			= require("mongoose"),
	  flash					= require("connect-flash"),
	  passport				= require("passport"),
	  LocalStrategy	= require("passport-local"),
	  methodOverride = require("method-override"),
	  moment				= require("moment");
	  Campground 		= require('./models/campground'),
	  Comment			= require('./models/comment'),
	  User 					= require("./models/user"),
	  Notification		= require("./models/notification"),
	  seedDB				= require('./seeds.js');

//requiring routes
var 	commentRoutes	= require("./routes/comments"),
		reviewRoutes			= require("./routes/reviews"),
		campgroundRoutes	= require("./routes/campgrounds"),
		indexRoutes				= require("./routes/index"),
		userRoutes				= require("./routes/users");

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
app.use((req, res, next)=>{
	res.locals.currentUser = req.user;
	if(req.user){
		User.findById(req.user._id).populate("notifications", null, {isRead: false}).exec((err, user)=>{
			if(err){
				console.log(err);
			}
			res.locals.notifications = user.notifications.reverse();
		});
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

app.listen(PORT, ()=>{
	console.log("Yelpcamp Has Started");
	console.log("Server is listening at 'localhost:3000'");
});