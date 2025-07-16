const { required } = require("joi");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    //required: [true, "Email is required"],
   // match: [/.+@.+\..+/, "Please enter a valid email address"],
  },
});

userSchema.plugin(passportLocalMongoose); // Adds username, hash, salt

module.exports = mongoose.model("User", userSchema);