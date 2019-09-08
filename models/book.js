var mongoose   = require("mongoose");

//SCHEMA

var BookSchema = new mongoose.Schema({
	title : String,
	image : String,
	description: String,
	location: String,
	lat: Number,
	lng: Number,
	price: Number,
	author: String,
	createdAt: { type: Date, default: Date.now },
	createdBy:{
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref:"User"
		},
		username:String
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Comment"
		}
	]
});

module.exports = mongoose.model("Book", BookSchema);
