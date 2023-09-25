// databaseUtils.js

const User = require("./models/user");
const Topic = require("./models/topic");
const Comment = require("./models/comment");
const Reply = require("./models/reply");
const { useStore } = require("vuex");

const store = useStore();

async function insertUser(userData) {
  const newUser = new User(userData);
  await newUser.save();
  return newUser;
}

async function insertTopic(topicData) {
  const newTopic = new Topic(topicData);
  await newTopic.save();
  return newTopic;
}

async function insertComment(commentData) {
  const newComment = new Comment(commentData);
  await newComment.save();
  return newComment;
}

async function insertReply(replyData) {
  const newReply = new Reply(replyData);
  await newReply.save();
  return newReply;
}

async function insertData() {
  const topics = store.state.topics;
  const userData = store.state.users;

  for (const topic of topics) {
    const topicData = { ...topic };
    const proComments = [];
    const contraComments = [];

    // Separate pro and contra comments
    for (const comment of topic.proComments) {
      const newComment = await insertComment(comment);
      proComments.push(newComment);
    }

    for (const comment of topic.contraComments) {
      const newComment = await insertComment(comment);
      contraComments.push(newComment);
    }

    // Set pro and contra comments
    topicData.proComments = proComments.map((comment) => comment._id);
    topicData.contraComments = contraComments.map((comment) => comment._id);

    // Insert topic
    const newTopic = await insertTopic(topicData);

    // Update comments with topic reference
    for (const comment of proComments.concat(contraComments)) {
      comment.topicId = newTopic._id;
      await comment.save();
    }
  }
}

module.exports = { insertData };
