var mongoose	 = require('mongoose');
var passportLocalMongoose = require("passport-local-mongoose");

var userSchema = new mongoose.Schema({
	username: {	type: String, 	unique: true, required: true	},
	password: String,
	avatar: { type: String, default: "https://res.cloudinary.com/infinity99/image/upload/v1584729718/avatar/User_Avatar_ub5jq9.png" },
	avatarId: String,
	firstName: String,
	lastName:{ type: String, default: "" },
	email: { type: String, unique: true,	required: true	},
	isAdmin: { type: Boolean, default: false	 },
	description: { type: String, default: "" },
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	notifications: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Notification"
		}
	],
	followers: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}
	]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",  userSchema);