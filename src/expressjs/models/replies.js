
const mongoose = require("mongoose");
const replySchema = new mongoose.Schema({
  text: String,
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: Date,
  downvotes: Number,
  expandReplies: Boolean,
  replies: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reply",
    },
  ],
  replytype: String,
  topicId: String,
  upvotes: Number,
});
const Reply = mongoose.model("Reply", replySchema);
module.exports = Reply;