var mongoose = require("mongoose");

var reviewSchema = new mongoose({
	rating: {
		//Setting the star rating required
		type:Number,
		required: "Please provide a rating (1-5 stars).",
		//Defining min and max values
		min = 1,
		max = 5,
		//Adding validation to see if the entry is an integer
		validate: {
			validator: Number.isInteger,
			message: "{Value} is not an integer value."
		}
	},
	//review text
	text: {
		type: String
	},
	//author id and username fields
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		}.
		username: Stringa
	},
	//campground associated with the review
	campground: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Campground"
	}
}, {
	//if timestamp are set to true, mongoose assigns createdAt and updatedAt fields to the schema, the type assigned is Date.
	timestamp: true
});

mongoose.exports = mongoose.model("Review", reviewSchema);