// store.js
import { createStore } from 'vuex';
import { v4 as uuidv4 } from 'uuid';

function generateFakeUser(id, name) {
  return {
    id,
    name,
    profileImage: generateFakeProfileImage(name),
  };
}

function generateFakeProfileImage(name) {
  return `https://fakeimg.pl/50x50/?text=${name[0]}&font=lobster`;
}
//Test Antwdsdfffffffzzzzzzzzzzzzzzzzzzzzzzzzzfffffffffffffffffffffffffsssssssssssssssssssssssssssssssssssssssssssssssort
function generateReplies(count, userId, userName) {
  const replies = [];
  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const newReply = {
      id,
      text: `hallo ${i + 1}`,
      author: generateFakeUser(userId, userName),
      votes: {}, // Hinzufügen von Votes
    };
    replies.push(newReply);
  }
  return replies;
}

function generateComments(count, users) {
  const comments = [];
  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const authorId = 2; // Ersetzen Sie dies durch die tatsächliche Benutzer-ID
    const newComment = {
      id,
      text: `Test Kommentar ${i + 1}`,
      author: {
        ...users.find((user) => user.id === authorId),
        profileImage: generateFakeProfileImage(users[1].name)
      },
      replies: generateReplies(3, 1, 'John Doe'),
      votes: {}, // Hinzufügen von Votes
    };
    comments.push(newComment);
  }
  return comments;
}

function generateTopics(count, users) {
  const topics = [];
  for (let i = 0; i < count; i++) {
    const id = i + 1;
    const newTopic = {
      id,
      image: `https://fakeimg.pl/250x100/?text=Thema${id}&font=lobster`,
      title: `Fakes Thema ${id}`,
      text: `Dies ist eine Beschreibung für das Fake Thema ${id}.`,
      comments: generateComments(3, users),
      likes: {
        '-4': Math.floor(Math.random() * 100),
        '-3': Math.floor(Math.random() * 100),
        '-2': Math.floor(Math.random() * 100),
        '-1': Math.floor(Math.random() * 100),
        '1': Math.floor(Math.random() * 100),
        '2': Math.floor(Math.random() * 100),
        '3': Math.floor(Math.random() * 100),
        '4': Math.floor(Math.random() * 100),
      },
    };
    topics.push(newTopic);
  }
  return topics;
}

export default createStore({
  state() {
    const users = [
      {
        id: 1,
        name: 'Dejan Pantos',
        profileImage: generateFakeProfileImage('Dejan Pantos'),
  
      },
      {
        id: 2,
        name: 'Lionel Messi',
        profileImage: generateFakeProfileImage('Lionel Messi'),
  
      },
    ];

    return {
      topics: generateTopics(10, users),
      users,
      currentUser: users[0],
    };
  },
  mutations: {
    UPVOTE_COMMENT(state, { comment, userId }) {
      if (!comment.votes) {
        comment.votes = {};
      }
      comment.votes[userId] = 1; // 1 steht für upvote
    },
    DOWNVOTE_COMMENT(state, { comment, userId }) {
      if (!comment.votes) {
        comment.votes = {};
      }
      comment.votes[userId] = -1; // -1 steht für downvote
    },







    ADD_COMMENT_TO_TOPIC(state, { topicId, comment }) {
      const topic = state.topics.find((topic) => topic.id === topicId);
      if (topic) {
        topic.comments.push(comment);
      }
    },
    ADD_REPLY_TO_COMMENT(state, { commentId, reply }) {
      function searchReplies(replies) {
        for (const reply of replies) {
          if (reply.id === commentId) {
            return reply;
          }
          if (reply.replies) {
            const foundReply = searchReplies(reply.replies);
            if (foundReply) {
              return foundReply;
            }
          }
        }
        return null;
      }

      for (const topic of state.topics) {
        for (const comment of topic.comments) {
          if (comment.id === commentId) {
            if (!comment.replies) {
              comment.replies = [];
            }
            comment.replies.push(reply);
            return;
          }
          if (comment.replies) {
            const foundComment = searchReplies(comment.replies);
            if (foundComment) {
              if (!foundComment.replies) {
                foundComment.replies = [];
              }
              foundComment.replies.push(reply);
              return;
            }
          }
        }
      }
    },
    ADD_COMMENTS_TO_TOPIC(state, { topicId, comments }) {
      const topic = state.topics.find((topic) => topic.id === topicId);
      if (topic) {
        topic.comments.push(...comments);
      }
    },
  },
  actions: {

    upvoteComment(context, { commentId }) {
      const userId = context.state.currentUser.id; // Erhalten Sie die Benutzer-ID von currentUser im Zustand
      const comment = context.getters.getCommentById(commentId);
      context.commit('UPVOTE_COMMENT', { comment, userId });
    },
    downvoteComment(context, { commentId }) {
      const userId = context.state.currentUser.id; // Erhalten Sie die Benutzer-ID von currentUser im Zustand
      const comment = context.getters.getCommentById(commentId);
      context.commit('DOWNVOTE_COMMENT', { comment, userId });
    },

    addCommentToTopic({ commit }, { topicId, comment }) {
      comment.id = uuidv4();
      commit('ADD_COMMENT_TO_TOPIC', { topicId, comment });
    },
    addReplyToComment({ commit }, { commentId, reply }) {
      commit('ADD_REPLY_TO_COMMENT', { commentId, reply });
    },
    fetchComments({ state, commit }) {
      if (state.topics.every((topic) => topic.comments.length > 0)) {
        return;
      }

      for (const topic of state.topics) {
        if (topic.comments.length === 0) {
          const comments = generateComments(3, state.users);
          commit('ADD_COMMENTS_TO_TOPIC', { topicId: topic.id, comments });
        }
      }
    },
  },
  getters: {
    getTopicById: (state) => (id) => {
      return state.topics.find((topic) => topic.id === id);
    },
    getUserProfile: (state) => {
      return state.users[0];
    },
  
      getCommentById: (state) => (commentId) => {
        // Zuerst in den Kommentaren suchen
        for (const topic of state.topics) {
          for (const comment of topic.comments) {
            if (comment.id === commentId) {
              return comment;
            }
          }
        }
    
        // Wenn nicht in den Kommentaren gefunden, in den Antworten suchen
        function searchReplies(replies) {
          for (const reply of replies) {
            if (reply.id === commentId) {
              return reply;
            }
            if (reply.replies) {
              const foundReply = searchReplies(reply.replies);
              if (foundReply) {
                return foundReply;
              }
            }
          }
          return null;
        }
    
        for (const topic of state.topics) {
          for (const comment of topic.comments) {
            if (comment.replies) {
              const foundComment = searchReplies(comment.replies);
              if (foundComment) {
                return foundComment;
              }
            }
          }
        }
    
        console.log("getCommentById: Comment not found!");
        return null;
      
    },
    getAllComments: (state) => {
      let allComments = [];
      for (let topic of state.topics) {
        allComments = allComments.concat(topic.comments);
      }
      return allComments;
    },
  },
});
