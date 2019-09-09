var mongoose = require("mongoose")
var passportLocalMongoose = require("passport-local-mongoose")

var UserSchema = new mongoose.Schema({
	username : String,
	password : String,
	likes: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Book"
		}
	]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
