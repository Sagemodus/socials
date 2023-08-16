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



function findComment(state, commentId) {
  for (const topic of state.topics) {
    const comment = topic.comments.find(comment => comment.id === commentId);
    if (comment) {
      return comment;
    }
  }
  return null;
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
      text: `Hallo Antwort ${i + 1} von ${userName}...`,
      author: generateFakeUser(userId, userName),
      votes: {
        upvotes: 5,
        downvotes: 3,
      },
      replies: generateReplies(count - 1, userId, userName), // Generiere Antworten auf diese Antwort
    };
    replies.push(newReply);
  }
  return replies;
}



function generateComments(count, users) {
  const comments = [];
  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const authorId = 2; 
    const newComment = {
      id,


      text: `Test Kommentar ${i + 1} ...`,
      author: {
        ...users.find((user) => user.id === authorId),
        profileImage: generateFakeProfileImage(users[1].name)
      },
      replies: generateReplies(4, 2, users[0].name, users),
      votes: {
        upvotes: 3, // Initialize upvotes with 0
        downvotes: 0, // Initialize downvotes with 0
      },
    };
    comments.push(newComment);
  }
  return comments;
}

function generateTopics(count, users) {
  const topics = [];
  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const newTopic = {
      id,
      image: `https://fakeimg.pl/250x100/?text=Thema${id}&font=lobster`,
      title: `Fakes Thema ${id}`,
      text: `Dies ist eine Beschreibung...`,
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
        party: '4',
  
      },
      {
        id: 2,
        name: 'Lionel Messi',
        profileImage: generateFakeProfileImage('Lionel Messi'),
        party: '-2',
  
      },
      
    ];

    return {
      topics: generateTopics(10, users),
      users,
      currentUser: users[0],
      userLikes: {},
      likes: [], // Array to store likes
    };

  },
  mutations: {
    UPVOTE_COMMENT(state, { commentId }) {
      const comment = findComment(state, commentId);
      if (comment) {
        if (comment.hasUpvoted) {
          // Wenn bereits upgevotet, entferne den Upvote
          comment.votes.upvotes -= 1;
          comment.hasUpvoted = false;
        } else {
          // Wenn nicht upgevotet, füge den Upvote hinzu
          if (comment.isDownvoted) {
            // Wenn der Kommentar bereits downgevotet wurde, entferne den Downvote
            comment.votes.downvotes -= 1;
            comment.isDownvoted = false;
          }
          comment.votes.upvotes += 1;
          comment.hasUpvoted = true;
        }
      }
    },
    
  
    DOWNVOTE_COMMENT(state, { commentId }) {
      const comment = findComment(state, commentId);
      if (comment) {
        if (comment.hasDownvoted) {
          // Wenn bereits downgevotet, entferne den Downvote
          comment.votes.downvotes -= 1;
          comment.hasDownvoted = false;
        } else {
          // Wenn nicht downgevotet, füge den Downvote hinzu
          if (comment.isUpvoted) {
            // Wenn der Kommentar bereits upgevotet wurde, entferne den Upvote
            comment.votes.upvotes -= 1;
            comment.isUpvoted = false;
          }
          comment.votes.downvotes += 1;
          comment.hasDownvoted = true;
        }
      }
    },
    
    TOGGLE_LIKE(state, { topicId, group, userId }) {
      const topic = state.topics.find(topic => topic.id === topicId);
      if (topic) {
        if (!state.userLikes[userId]) {
          state.userLikes[userId] = {};
        }
  
        // Überprüfen, ob der Benutzer bereits für diesen Beitrag in dieser Gruppe gestimmt hat
        if (state.userLikes[userId][topicId] === group) {
          // Wenn ja, entfernen Sie die Stimmabgabe
          topic.likes[group] = topic.likes[group] > 0 ? topic.likes[group] - 1 : 0;
          delete state.userLikes[userId][topicId];
        } else {
          // Wenn nicht, fügen Sie die Stimmabgabe hinzu
          topic.likes[group] = topic.likes[group] ? topic.likes[group] + 1 : 1;
          state.userLikes[userId][topicId] = group;
        }
      }
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
  

    upvoteComment({ commit }, { commentId }) {
      commit('UPVOTE_COMMENT', { commentId });
    },
  
    downvoteComment({ commit }, { commentId }) {
      commit('DOWNVOTE_COMMENT', { commentId });
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

 // Check if a user has liked a comment
 getAllComments(state) {
  let allComments = [];
  for (let topic of state.topics) {
    allComments = allComments.concat(topic.comments);
  }
  return allComments;
},



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
   
    getUserParty(state) {
      return state.currentUser.party;
    },

  },
});