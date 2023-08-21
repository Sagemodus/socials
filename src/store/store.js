// store.js
import { createStore } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';
import faker from 'faker';


function updatePercentages(topic) {
  const totalVotes = topic.likes.upvotes + topic.likes.downvotes;
  topic.likes.upvotePercentage = ((topic.likes.upvotes / totalVotes) * 100).toFixed(2);
  topic.likes.downvotePercentage = ((topic.likes.downvotes / totalVotes) * 100).toFixed(2);
}

function generateFakeUser(id) {
  return {
    id,
    name: faker.name.findName(),
    profileImage: `https://fakeimg.pl/50x50/?text=${faker.name.findName(id)}&font=lobster`,
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
function generateReplies(count, userId) {
  const replies = [];
  for (let i = 0; i < count; i++) {
    const id = faker.datatype.uuid();
    const newReply = {
      id,
      text: faker.lorem.paragraphs(),
      author: generateFakeUser(userId),
      votes: {
        upvotes: faker.datatype.number(),
        downvotes: faker.datatype.number(),
      },
      replies: generateReplies(count - 1, userId),
    };
    replies.push(newReply);
  }
  return replies;
}



function generateComments(count, users) {
  const comments = [];
  for (let i = 0; i < count; i++) {
    const id = faker.datatype.uuid();
    const authorId = faker.datatype.number({ min: 0, max: users.length - 1 });
    const newComment = {
      id,
      text: faker.lorem.paragraph(),
      author: generateFakeUser(users[authorId].id),
      replies: generateReplies(4, users[authorId].id),
      votes: {
        upvotes: faker.datatype.number(),
        downvotes: faker.datatype.number(),
      },

    };
    comments.push(newComment);
  }
  return comments;
}




function generateTopics(count, users) {
  const categories = [
    { main: "Sport", sub: "Fussball" },
    { main: "Technologie", sub: "Programmierung" },
    { main: "Unterhaltung", sub: "Film" },
    { main: "Technologie", sub: "Gaming" },
    // Weitere Kategorien hinzufügen...
  ];

  const topics = [];
  for (let i = 0; i < count; i++) {
    const id = faker.datatype.uuid();
    const category = faker.random.arrayElement(categories); // Zufällige Kategorie auswählen

    const newTopic = {
      id,
      text: faker.lorem.paragraph(),
      comments: generateComments(3, users),
      createdBy: users[faker.datatype.number({ min: 0, max: users.length - 1 })],
      createdAt: faker.date.past(),
      likes: {
        upvotes: faker.datatype.number({ min: 0, max: 100 }),
        downvotes: faker.datatype.number({ min: 0, max: 100 }),
      },
      category: category, // Verwendet die zufällig ausgewählte Kategorie
    };

    // Berechne Prozentwerte
    const totalVotes = newTopic.likes.upvotes + newTopic.likes.downvotes;
    const upvotePercentage = (newTopic.likes.upvotes / totalVotes) * 100;
    const downvotePercentage = (newTopic.likes.downvotes / totalVotes) * 100;

    newTopic.likes.upvotePercentage = upvotePercentage.toFixed(2);
    newTopic.likes.downvotePercentage = downvotePercentage.toFixed(2);

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
        farbe: '4',
  
      },
      {
        id: 2,
        name: 'Lionel Messi',
        profileImage: generateFakeProfileImage('Lionel Messi'),
        farbe: '-2',
  
      },
      
    ];

    return {
      topics: generateTopics(10, users),
      users,
      currentUser: users[0],
 
  // Array to store likes
    };

  },
  mutations: {


    UPDATE_TOPIC_PERCENTAGES(state, { topicId }) {
      const topic = state.topics.find((topic) => topic.id === topicId);
      if (topic) {
        const totalVotes = topic.likes.upvotes + topic.likes.downvotes;
        topic.likePercentage = totalVotes === 0 ? 0 : Math.round((topic.likes.upvotes / totalVotes) * 100);
        topic.dislikePercentage = totalVotes === 0 ? 0 : Math.round((topic.likes.downvotes / totalVotes) * 100);
      }
    },
  

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
          } else {
            // Wenn weder upgevotet noch downgevotet wurde, initialisiere die Vote-Eigenschaften
            if (!comment.votes) {
              comment.votes = { upvotes: 0, downvotes: 0 };
            }
            comment.votes.upvotes += 1;
            comment.hasUpvoted = true;
          }
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
          if (comment.hasUpvoted) {
            // Wenn der Kommentar bereits upgevotet wurde, entferne den Upvote
            comment.votes.upvotes -= 1;
            comment.hasUpvoted = false;
          }
          // Initialisiere die Vote-Eigenschaften, wenn es noch keine gibt
          if (!comment.votes) {
            comment.votes = { upvotes: 0, downvotes: 0 };
          }
          comment.votes.downvotes += 1;
          comment.hasDownvoted = true;
        }
      }
    },


    UPVOTE_REPLY(state,{replyId}){
const reply = this.getters.getCommentById(replyId);{
  if (reply) {
    if (reply.hasUpvoted) {
      // Wenn bereits upgevotet, entferne den Upvote
      reply.votes.upvotes -= 1;
      reply.hasUpvoted = false;
    } else {
      // Wenn nicht upgevotet, füge den Upvote hinzu
      if (reply.hasDownvoted) {
        // Wenn die Antwort bereits downgevotet wurde, entferne den Downvote
        reply.votes.downvotes -= 1;
        reply.hasDownvoted = false;
      }
      // Initialisiere die Vote-Eigenschaften, wenn es noch keine gibt
      if (!reply.votes) {
        reply.votes = { upvotes: 0, downvotes: 0 };
      }
      reply.votes.upvotes += 1;
      reply.hasUpvoted = true;
    }
  }
}
    },
  // Mutation für das Downvoten einer Antwort (reply)
  DOWNVOTE_REPLY(state, { replyId }) {
    const reply = this.getters.getCommentById(replyId); // Nutze die Getter-Funktion
    if (reply) {
      if (reply.hasDownvoted) {
        // Wenn bereits downgevotet, entferne den Downvote
        reply.votes.downvotes -= 1;
        reply.hasDownvoted = false;
      } else {
        // Wenn nicht downgevotet, füge den Downvote hinzu
        if (reply.hasUpvoted) {
          // Wenn die Antwort bereits upgevotet wurde, entferne den Upvote
          reply.votes.upvotes -= 1;
          reply.hasUpvoted = false;
        }
        // Initialisiere die Vote-Eigenschaften, wenn es noch keine gibt
        if (!reply.votes) {
          reply.votes = { upvotes: 0, downvotes: 0 };
        }
        reply.votes.downvotes += 1;
        reply.hasDownvoted = true;
      }
    }
  },

  // Mutation für das Upvoten einer Antwort (reply)
  TOGGLE_LIKE(state, { topicId }) {
    const topic = state.topics.find((topic) => topic.id === topicId);
  
    if (topic) {
      if (topic.hasUpvoted) {
        // If already upvoted, remove the upvote
        topic.likes.upvotes -= 1;
        topic.hasUpvoted = false;
      } else {
        // If not upvoted, add the upvote
        if (topic.hasDownvoted) {
          // If topic was previously downvoted, remove the downvote
          topic.likes.downvotes -= 1;
          topic.hasDownvoted = false;
        }
        if (!topic.likes) {
          topic.likes = { upvotes: 0, downvotes: 0 };
        }
        topic.likes.upvotes += 1;
        topic.hasUpvoted = true;
      }
  
      updatePercentages(topic); // Update percentages
    }
  },
  
  TOGGLE_DISLIKE(state, { topicId }) {
    const topic = state.topics.find((topic) => topic.id === topicId);
  
    if (topic) {
      if (topic.hasDownvoted) {
        // If already downvoted, remove the downvote
        topic.likes.downvotes -= 1;
        topic.hasDownvoted = false;
      } else {
        // If not downvoted, add the downvote
        if (topic.hasUpvoted) {
          // If topic was previously upvoted, remove the upvote
          topic.likes.upvotes -= 1;
          topic.hasUpvoted = false;
        }
        if (!topic.likes) {
          topic.likes = { upvotes: 0, downvotes: 0 };
        }
        topic.likes.downvotes += 1;
        topic.hasDownvoted = true;
      }
  
      updatePercentages(topic); // Update percentages
    }
  },
// Topic Likes und dislikes


    // Kommentare
    ADD_COMMENT_TO_TOPIC(state, { topicId, comment }) {
      const topic = state.topics.find((topic) => topic.id === topicId);
      if (topic) {
        if (comment.text.trim() !== "") {
          // Initialisiere die Vote-Eigenschaften für den neuen Kommentar
          comment.votes = { upvotes: 0, downvotes: 0 };
          topic.comments.push(comment);
        } else {
          // Zeige eine SweetAlert-Meldung, wenn der Kommentar leer ist
          Swal.fire({
            icon: 'error',
            title: 'Fehler',
            text: 'Der Kommentar darf nicht leer sein.',
            confirmButtonText: 'OK',
          });
        }
      }
    },
   
    
    
  

  },
  actions: {

    updateTopicPercentages({ commit }, { topicId }) {
      commit('UPDATE_TOPIC_PERCENTAGES', { topicId });
    },

    upvoteComment({ commit }, { commentId }) {
      commit('UPVOTE_COMMENT', { commentId });
    },
  
    downvoteComment({ commit }, { commentId }) {
      commit('DOWNVOTE_COMMENT', { commentId });
    },
  

    upvoteReply({ commit }, { replyId }) {
      commit('UPVOTE_REPLY', { replyId });
    },
    downvoteReply({ commit }, { replyId }) {
      commit('DOWNVOTE_REPLY', { replyId });
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
   
    getUserfarbe(state) {
      return state.currentUser.farbe;
    },

  },
});