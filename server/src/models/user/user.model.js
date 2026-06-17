const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
  username: String,
  email: {
    type: String,
    unique: true,
    required: true,
  },
  passwordHash: String,
  hardwareID: String,
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
