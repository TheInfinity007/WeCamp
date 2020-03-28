var mongoose = require("mongoose");

var feedbackSchema = new mongoose.Schema({
	text: { type: String, required: true },
	review: {
		type: Number, 
		min: 1, 
		max:5, 
		required: true
	}
});

module.exports = mongoose.model("Feedback", feedbackSchema);