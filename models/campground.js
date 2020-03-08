var mongoose = require('mongoose');
var Comment = require("./comment");
var Review 	 = require("./review");

/* schema setup */
var campgroundSchema = new mongoose.Schema({
	name: String,
	cost: Number,
	image: String,
	description: String,
	createdAt: {type: Date, default: Date.now},
	author: {
		id:{
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	comments : [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	],

	//hold the reviews of the objectId references
	reviews: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Review"
		}
	],
	//hold the average rating of a campground
	rating: {
		type: Number,
		default: 0
	}
});

campgroundSchema.pre('remove', async (next)=>{
	try{
		await Comment.remove({
			"_id" : {
				$in: this.comments
			}
		});
	}catch(err){
		next(err);
	}
});

var Campground = mongoose.model("Campground", campgroundSchema);

module.exports = Campground;