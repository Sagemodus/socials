// store.js
import { createStore } from 'vuex';
import { v4 as uuidv4 } from 'uuid';
import Swal from 'sweetalert2';
import faker from 'faker';
import dayjs from 'dayjs';
import firebase from 'firebase/app'




export function formatCreatedAt(createdAt) {
  const createdAtDate = dayjs(createdAt);
  const now = dayjs();

  const diff = now.diff(createdAtDate, 'minute');

  if (diff < 1) {
    return 'Now';
  } else if (diff < 60) {
    return `${diff}m`;
  } else if (diff < 24 * 60) {
    return `${Math.floor(diff / 60)}h`;
  } else if (diff < 30 * 24 * 60) {
    return `${Math.floor(diff / (24 * 60))}d`;
  } else if (diff < 365 * 24 * 60) {
    return `${Math.floor(diff / (30 * 24 * 60))}mo`;
  } else {
    return `${Math.floor(diff / (365 * 24 * 60))}y`;
  }
}



function updatePercentages(topic) {
  const totalVotes = topic.upvotes + topic.downvotes;
  topic.upvotePercentage = ((topic.upvotes / totalVotes) * 100).toFixed(2);
  topic.downvotePercentage = ((topic.downvotes / totalVotes) * 100).toFixed(2);
}

function generateFakeUser(id) {
  return {
    id,
    name: faker.name.findName(),
    profileImage: `https://fakeimg.pl/50x50/?text=${faker.name.findName(id)}&font=lobster`,
  };
}
function searchCommentInArray(comments, commentId) {
  for (const comment of comments) {
    if (comment.id === commentId) {
      console.log("Found comment with ID:", commentId);
      return comment;
    }
    if (comment.replies) {
      const foundReply = searchCommentInArray(comment.replies, commentId);
      if (foundReply) {
        return foundReply;
      }
    }
  }
  return null;
}





function generateFakeProfileImage(name) {
  return `https://fakeimg.pl/50x50/?text=${name[0]}&font=lobster`;
}
//Test Antwdsdfffffffzzzzzzzzzzzzzzzzzzzzzzzzzfffffffffffffffffffffffffsssssssssssssssssssssssssssssssssssssssssssssssort
function generateReplies(count, userId,topicId) {
  const replies = [];
  for (let i = 0; i < count; i++) {
    const id = faker.datatype.uuid();
    const newReply = {
      id,
      topicId: topicId,
      text: faker.lorem.paragraphs(),
      author: generateFakeUser(userId),
      upvotes: faker.datatype.number(),
      downvotes: faker.datatype.number(),
      createdAt: faker.date.past(), // Erstellungsdatum hinzufügen
      replies: generateReplies(count - 1, userId,topicId),
    };
    replies.push(newReply);
  }
  return replies;
}

function generateComments(count, users,topicId) {
  const comments = [];
  for (let i = 0; i < count; i++) {
    const id = faker.datatype.uuid();
    const authorId = faker.datatype.number({ min: 0, max: users.length - 1 });
    const newComment = {
      id,
      topicId: topicId,
      text: faker.lorem.paragraph(),
      author: generateFakeUser(users[authorId].id),
      
    upvotes: faker.datatype.number(),
    downvotes: faker.datatype.number(),
      
      createdAt: faker.date.past(), // Erstellungsdatum hinzufügen
      replies: generateReplies(4, users[authorId].id,topicId),
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
    const category = faker.random.arrayElement(categories);

    const newTopic = {
      id,
      text: faker.lorem.paragraph(),
      createdBy: users[faker.datatype.number({ min: 0, max: users.length - 1 })],
      createdAt: faker.date.past(),
        upvotes: faker.datatype.number({ min: 0, max: 100 }),
        downvotes: faker.datatype.number({ min: 0, max: 100 }),
      category: category,
      proComments: [],    // Array for "pro" comments
      contraComments: [], // Array for "contra" comments
    };

    // Berechne Prozentwerte
    const totalVotes = newTopic.upvotes + newTopic.downvotes;
    const upvotePercentage = (newTopic.upvotes / totalVotes) * 100;
    const downvotePercentage = (newTopic.downvotes / totalVotes) * 100;

    newTopic.upvotePercentage = upvotePercentage.toFixed(2);
    newTopic.downvotePercentage = downvotePercentage.toFixed(2);

    newTopic.proComments = generateComments(5, users,newTopic.id); // Generate "pro" comments
    newTopic.contraComments = generateComments(5, users,newTopic.id); // Generate "contra" comments

    topics.push(newTopic);
  }
  return topics;
}

function searchReplyInCommentAndReplies(comment, targetReplyId) {
  if (comment.id === targetReplyId) {
    return comment;
  }
  
  for (const reply of comment.replies) {
    if (reply.id === targetReplyId) {
      return reply;
    }
    const foundReply = searchReplyInCommentAndReplies(reply, targetReplyId);
    if (foundReply) {
      return foundReply;
    }
  }
  
  return null;
}


export default createStore({

  state() {

    const loggedin = 'true';
    const users = [
      {
        id: 1,
        name: 'Dejan Pantos',
        profileImage: generateFakeProfileImage('Dejan Pantos'),
        farbe: '4',
        tweets: [0], // Liste der Tweets des Benutzers1
        createdReplies: [],
        procreated: [],
        contracreated: [],
        haslikedcomment:[],
        hasdislikedcomment:[],
        haslikedreply:[],
        hasdislikedreply:[],
        haslikedtopic:[],
        hasdislikedtopic:[],
        following: [15,16],
        followers: [18,25,27], // Liste der Follower des Benutzerspro
        notifications: [], // Benachrichtigungen für den Benutzer
        messages: [], // Privatnachrichten des Benutzers
        topicsaves:[],
        joinedAt:'28.08.2023',
        email:"dejan.pantos@maschene.com",
        bio: 'King of the street',
       
      },



      
    ];


    return {
      topics: generateTopics(10, users),
      users,
      currentUser: users[0],
      loggedin,
      selectedTab: 'pro',
      selectedTabColor : 'green',
      sessionId: null, 
  // Array to store likes
    };

    

  },

  mutations: {
  
    

// Login mutation
setSessionId(state, sessionId) {
  state.sessionId = sessionId;
},


   SET_SELECTED_TAB_COLOR(state,color){
    state.selectedTabColor=color;
   },

    UPDATE_TOPIC_PERCENTAGES(state, { topicId }) {
      const topic = state.topics.find((topic) => topic.id === topicId);
      if (topic) {
        const totalVotes = topic.upvotes + topic.downvotes;
        topic.likePercentage = totalVotes === 0 ? 0 : Math.round((topic.upvotes / totalVotes) * 100);
        topic.dislikePercentage = totalVotes === 0 ? 0 : Math.round((topic.downvotes / totalVotes) * 100);
      }
    },
  
    UPVOTE_COMMENT(state, { commentId, currentUserId,topicId }) {
     
      
      const userId = currentUserId;
      const topic = state.topics.find((topic) => topic.id===topicId);
      const comment = topic.proComments.find((comment) => comment.id===commentId)||topic.contraComments.find((topic) => topic.id===commentId);
      if (comment) {
        const user = state.users.find((user) => user.id === userId);
        if (user) {
          if (user.haslikedcomment.includes(commentId)) {
            // Wenn der Kommentar bereits geliked wurde, entferne den Like
            comment.upvotes -= 1;
            user.haslikedcomment = user.haslikedcomment.filter((id) => id !== commentId);
          } else {
            // Wenn der Kommentar noch nicht geliked wurde, füge den Like hinzu
            if (user.hasdislikedcomment.includes(commentId)) {
              // Wenn der Benutzer den Kommentar bereits disliket hat, entferne den Dislike
              comment.downvotes -= 1;
              user.hasdislikedcomment = user.hasdislikedcomment.filter((id) => id !== commentId);
            }
            comment.upvotes += 1;
            user.haslikedcomment.push(commentId);
            
            // Entferne den Dislike, falls vorhanden
           
          }
        }
      }
    },
    
    DOWNVOTE_COMMENT(state, { commentId, currentUserId,topicId}) {
      const userId = currentUserId;
      const topic = state.topics.find((topic) => topic.id===topicId);
      const comment = topic.proComments.find((comment) => comment.id===commentId)||topic.contraComments.find((topic) => topic.id===commentId);
    
      if (comment) {
        const user = state.users.find((user) => user.id === userId);
        if (user) {
          if (user.hasdislikedcomment.includes(commentId)) {
            // Wenn der Kommentar bereits disliket wurde, entferne den Dislike
            comment.downvotes -= 1;
            user.hasdislikedcomment = user.hasdislikedcomment.filter((id) => id !== commentId);
          } else {
            // Wenn der Kommentar noch nicht disliket wurde, füge den Dislike hinzu
            if (user.haslikedcomment.includes(commentId)) {
              // Wenn der Benutzer den Kommentar bereits geliked hat, entferne den Like
              comment.upvotes -= 1;
              user.haslikedcomment = user.haslikedcomment.filter((id) => id !== commentId);
            }
            comment.downvotes += 1;
            user.hasdislikedcomment.push(commentId);
            
           
          }
        }
      }
    },

    UPVOTE_REPLY(state, { replyId, currentUserId, topicId, commentId }) {
      const topic = state.topics.find((topic) => topic.id === topicId);
      const comment = topic.proComments.find((comment) => comment.id === commentId) ||
                    topic.contraComments.find((comment) => comment.id === commentId);
      
      let reply = null;
      
      if (comment) {
        reply = searchReplyInCommentAndReplies(comment, replyId);
      } else {
        const topicComments = topic.proComments.concat(topic.contraComments);
        for (const topicComment of topicComments) {
          reply = searchReplyInCommentAndReplies(topicComment, replyId);
          if (reply) {
            break;
          }
        }
      }
      
      const user = state.users.find((user) => user.id === currentUserId);
    
      if (reply && user) {
        if (!user.haslikedreply.includes(replyId)) {
          // Add the like
          reply.upvotes += 1;
          user.haslikedreply.push(replyId);
    
          // Remove the dislike, if present
          if (user.hasdislikedreply.includes(replyId)) {
            reply.downvotes -= 1;
            user.hasdislikedreply = user.hasdislikedreply.filter((id) => id !== replyId);
          }
        } else {
          // Remove the like
          reply.upvotes -= 1;
          user.haslikedreply = user.haslikedreply.filter((id) => id !== replyId);
        }
      }
    },
    
    
    // Hilfsfunktion, um in Kommentaren und verschachtelten Antworten zu suchen
   
    DOWNVOTE_REPLY(state, { replyId, currentUserId, topicId, commentId }) {
      const topic = state.topics.find((topic) => topic.id === topicId);
      const comment = topic.proComments.find((comment) => comment.id === commentId) ||
                    topic.contraComments.find((comment) => comment.id === commentId);
      
      let reply = null;
      
      if (comment) {
        reply = searchReplyInCommentAndReplies(comment, replyId);
      } else {
        const topicComments = topic.proComments.concat(topic.contraComments);
        for (const topicComment of topicComments) {
          reply = searchReplyInCommentAndReplies(topicComment, replyId);
          if (reply) {
            break;
          }
        }
      }
      
      const user = state.users.find((user) => user.id === currentUserId);
    
      if (reply && user) {
        if (!user.hasdislikedreply.includes(replyId)) {
          // Add the dislike
          reply.downvotes += 1;
          user.hasdislikedreply.push(replyId);
    
          // Remove the like, if present
          if (user.haslikedreply.includes(replyId)) {
            reply.upvotes -= 1;
            user.haslikedreply = user.haslikedreply.filter((id) => id !== replyId);
          }
        } else {
          // Remove the dislike
          reply.downvotes -= 1;
          user.hasdislikedreply = user.hasdislikedreply.filter((id) => id !== replyId);
        }
      }
    },
    
TOGGLE_LIKE(state, { topicId, userId }) {
  const topic = state.topics.find((topic) => topic.id === topicId);

  if (topic) {
    const user = state.users.find((user) => user.id === userId);
    if (user) {
      if (!user.haslikedtopic.includes(topicId)) {
        
        // Füge den Like hinzu
        topic.upvotes += 1;
        user.haslikedtopic.push(topicId);
      } else {
        // Entferne den Like
        topic.upvotes -= 1;
        user.haslikedtopic = user.haslikedtopic.filter((id) => id !== topicId);
      }

      updatePercentages(topic); // Aktualisiere Prozentsätze
    }
  }
},

TOGGLE_DISLIKE(state, { topicId, userId }) {
  const topic = state.topics.find((topic) => topic.id === topicId);

  if (topic) {
    const user = state.users.find((user) => user.id === userId);
    if (user) {
      if (!user.hasdislikedtopic.includes(topicId)) {
        // Füge den Dislike hinzu
        topic.downvotes += 1;
        user.hasdislikedtopic.push(topicId);
      } else {
        // Entferne den Dislike
        topic.downvotes -= 1;
        user.hasdislikedtopic = user.hasdislikedtopic.filter((id) => id !== topicId);
      }

      updatePercentages(topic); // Prozentwerte aktualisieren
    }
  }
},
  
  
  
  


    // Kommentare
    ADD_COMMENT_TO_TOPIC(state, { topicId, comment, selectedTab }) {
      const topic = state.topics.find((topic) => topic.id === topicId);
      if (topic) {
        if (comment.text.trim() !== "") {
          // Initialize the Vote properties for the new comment
          comment.upvotes= 0
          comment.downvotes= 0
    
          if (selectedTab === 'contra') { // Richtiges Property verwenden
            topic.contraComments.push(comment);
            state.currentUser.contracreated.push(comment.id)
          } else {
            topic.proComments.push(comment);
            state.currentUser.procreated.push(comment.id)
          }
        } else {
          // Show a SweetAlert message if the comment is empty
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'The comment cannot be empty.',
            confirmButtonText: 'OK',
          });
        }
      }
    },
    
   
  
    ADD_TOPIC_TO_SAVES(state, topicId) {
      if (state.currentUser) {
        const index = state.currentUser.topicsaves.indexOf(topicId);
        if (index === -1) {
          // Thema ist noch nicht gespeichert, also hinzufügen
          state.currentUser.topicsaves.push(topicId);
          console.log('Thema erfolgreich gespeichert.');
          
        } else {
          // Thema ist bereits gespeichert, also entfernen
          state.currentUser.topicsaves.splice(index, 1);
          console.log('Thema erfolgreich entfernt.');
        }
      }
    },
    
    SET_SELECTED_TAB(state, tab) {
      
      state.selectedTab = tab;
    },
 
  },
  actions: {
    addRandomGeneratedCommentsToRandomTopic({ state }) {
      const proCommentCount = 4;
      const contraCommentCount = 4;
  
      const randomTopicIndex = Math.floor(Math.random() * state.topics.length);
      const randomTopic = state.topics[randomTopicIndex];
  
      if (randomTopic) {
        for (let i = 0; i < proCommentCount; i++) {
          const newProComment = generateComments(1, state.users,randomTopic.id)[0];
          randomTopic.proComments.push(newProComment);
          state.currentUser.procreated.push(newProComment.id);
        }
        
        for (let i = 0; i < contraCommentCount; i++) {
          const newContraComment = generateComments(1, state.users,randomTopic.id)[0];
          randomTopic.contraComments.push(newContraComment);
          state.currentUser.contracreated.push(newContraComment.id);
        }
      }
    },
  
 

    updateSelectedTabColor({state,commit}){
      const selectedTabColor = state.selectedTab === 'pro' ? 'green' : 'red';
      console.log(selectedTabColor +'kolleg')
      commit('SET_SELECTED_TAB_COLOR',selectedTabColor)
   
      },

    selectTab({ commit }, tab) {
      
      commit('SET_SELECTED_TAB', tab);
    },

   
  
 
  
    updateTopicPercentages({ commit }, { topicId }) {
      commit('UPDATE_TOPIC_PERCENTAGES', { topicId });
    },

    upvoteComment({ commit }, { commentId,currentUserId,topicId }) {
      commit('UPVOTE_COMMENT', { commentId,currentUserId,topicId});
    },
  
   downvoteComment({ commit }, { commentId, currentUserId,topicId }) {
    commit('DOWNVOTE_COMMENT', { commentId, currentUserId,topicId });
  },
  

    upvoteReply({ commit }, { replyId,currentUserId,topicId,commentId}) {
      console.log(commentId + " mach kei sheiss")
      commit('UPVOTE_REPLY', { replyId,currentUserId,topicId,commentId });
    },
    downvoteReply({ commit }, { replyId ,currentUserId,topicId,commentId}) {
      commit('DOWNVOTE_REPLY', { replyId,currentUserId,topicId,commentId});
    }, 
    addCommentToTopic({ commit}, { topicId, comment, selectedTab }) {
      
      const updatedComment = { ...comment, id: uuidv4() }; // Zuweisung einer eindeutigen ID
      commit('ADD_COMMENT_TO_TOPIC', { topicId, comment: updatedComment, selectedTab });
    },
  
    fetchComments({ state, commit }) {
      if (state.topics.every((topic) => topic.proComments.length > 0 || topic.contraComments.length > 0)) {
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
    formattedCreatedAt: (state) => (createdAt) => {
      return formatCreatedAt(createdAt);
    },
    isTopicSaved: (state) => (topicId) => {
      if (state.currentUser) {
        return state.currentUser.topicsaves.includes(topicId);
      }
      return false;
    },

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
  for (const topic of state.topics) {
    const foundProComment = searchCommentInArray(topic.proComments, commentId);
    if (foundProComment) {
      return foundProComment;
    }

    const foundContraComment = searchCommentInArray(topic.contraComments, commentId);
    if (foundContraComment) {
      return foundContraComment;
    }
  }

  console.log("Comment not found!");
  return null;
},


    
    getUserfarbe(state) {
      return state.currentUser.farbe;
    },
    

  },
});