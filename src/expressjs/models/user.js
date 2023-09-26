const mongoose = require("mongoose");

// Erstellen Sie ein Schema für den "author"
const userSchema = new mongoose.Schema({
  name: String,
  bio: String,
  contracreated: Array,
  createdReplies: Array,
  email: String,
  farbe: String,
  filterSettings: Object,
  followers: Array,
  following: Array,
  hasdislikedcomment: Array,
  hasdislikedreply: Array,
  hasdislikedtopic: Array,
  haslikedcomment: Array,
  haslikedreply: Array,
  haslikedtopic: Array,
  id: Number,
  joinedAt: String,
  messages: Array,
  nestedReplies: Array,
  notifications: Array,
  procreated: Array,
  profileImage: String,
  topicsaves: Array,
  tweets: Array,
});

// Erstellen Sie ein Mongoose-Modell für den "author"
const User = mongoose.model("User", userSchema);

module.exports = User;
