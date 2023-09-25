const mongoose = require("mongoose");

// Definieren Sie Ihr Schema für die Topics-Collection
const topicSchema = new mongoose.Schema({
  text: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Author",
  },
  category: Object,
 contraComments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    }],
 
  createdAt: Date,
  downvotePercentage: String,
  downvotes: Number,
  id: String,
  path: String,
  proComments: [
   {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    }],
  upvotePercentage: String,
  upvotes: Number,
});

// Erstellen Sie Ihr Topic-Modell
const Topic = mongoose.model("Topic", topicSchema);

// Exportieren Sie Ihr Topic-Modell, um es in Ihrer Anwendung verwenden zu können
module.exports = Topic;
