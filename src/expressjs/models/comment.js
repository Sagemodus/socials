const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: String,
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: Date,
  downvotes: Number,
  expandReplies: Boolean,
  commentType: String,
  id: String,
  path: String,
  showelement: Boolean,
  topicId: String,
  upvotes: Number,
  commentIndes: Number,

  // Andere Kommentar-bezogene Eigenschaften
});
const Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;