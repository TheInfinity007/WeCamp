var mongoose	 = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
	username: {	type: String, 	unique: true, required: true	},
	password: String,
	avatar: { type: String, default: "https://upload.wikimedia.org/wikipedia/commons/6/67/User_Avatar.png" },
	firstName: String,
	lastName:{ type: String, default: "" },
	email: { type: String, unique: true,	required: true	},
	isAdmin: { type: Boolean, default: false	 },
	description: { type: String, default: "" },
	resetPasswordToken: String,
	resetPasswordExpires: Date
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",  userSchema);