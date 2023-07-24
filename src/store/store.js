//store.js

// Import der notwendigen Funktionen
import { createStore } from 'vuex';
import { v4 as uuidv4 } from 'uuid';


// Funktion zum Generieren von Antworten (Test-Query)
function generateReplies(count) {
  const replies = [];
  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const newReply = {
      id,
      text: `Test Antwort ${i + 1}`,
      author: { id: 1, name: 'Jane Doe' },
    };
    replies.push(newReply);
  }
  return replies;
}

// Funktion zum Generieren von Kommentaren (Test-Query)
function generateComments(count) {
  const comments = [];
  for (let i = 0; i < count; i++) {
    const id = uuidv4();
    const newComment = {
      id,
      text: `Test Kommentar ${i + 1}`,
      author: { id: 1, name: 'John Doe' },
      replies: generateReplies(3), // 3 Antworten für jeden Kommentar hinzufügen (Test-Query)
    };
    comments.push(newComment);
  }
  return comments;
}

// Funktion zum Generieren von Themen (Test-Query)
function generateTopics(count) {
  const topics = [];
  for (let i = 0; i < count; i++) {
    const id = i + 1;
    const newTopic = {
      id,
      image: `https://fakeimg.pl/250x100/?text=Thema${id}&font=lobster`,
      title: `Fakes Thema ${id}`,
      text: `Dies ist eine Beschreibung für das Fake Thema ${id}.`,
      comments: generateComments(3), // 3 Kommentare für jedes Thema hinzufügen (Test-Query)
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

// Erstellen des Vuex-Stores
export default createStore({
  state() {
    return {
      topics: generateTopics(10), // 10 Themen generieren
      user: {
        id: 1,
        name: 'John Doe',
        profileImage: 'https://fakeimg.pl/50x50/?text=JD&font=lobster',
      },
    };
  },
  mutations: {
    // Mutation zum Hinzufügen eines Kommentars zu einem Thema
    ADD_COMMENT_TO_TOPIC(state, { topicId, comment }) {
      const topic = state.topics.find((topic) => topic.id === topicId);
      if (topic) {
        topic.comments.push(comment);
      }
    },
    // Mutation zum Hinzufügen einer Antwort zu einem Kommentar
// Mutation zum Hinzufügen einer Antwort zu einem Kommentar
ADD_REPLY_TO_COMMENT(state, { commentId, reply }) {
  // Rekursive Hilfsfunktion zum Durchsuchen von Antworten
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

  // Durchsuchen Sie die Themen und Kommentare
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
  
    // Neue Mutation zum Hinzufügen von Kommentaren zu einem Thema
    ADD_COMMENTS_TO_TOPIC(state, { topicId, comments }) {
      const topic = state.topics.find((topic) => topic.id === topicId);
      if (topic) {
        topic.comments.push(...comments);
      }
    },
  },
  actions: {
    // Aktion zum Hinzufügen eines Kommentars zu einem Thema
    addCommentToTopic({ commit }, { topicId, comment }) {
      comment.id = uuidv4();
      commit('ADD_COMMENT_TO_TOPIC', { topicId, comment });
    },
    // Aktion zum Hinzufügen einer Antwort zu einem Kommentar
    addReplyToComment({ commit }, { commentId, reply }) {
      commit('ADD_REPLY_TO_COMMENT', { commentId, reply });
    },
    // Neue Aktion zum Abrufen oder Generieren von Kommentaren für Themen
    fetchComments({ state, commit }) {
      // Überprüfen, ob die Themen bereits Kommentare haben
      if (state.topics.every((topic) => topic.comments.length > 0)) {
        // Wenn Kommentare vorhanden sind, einfach zurückkehren, ohne etwas zu tun
        return;
      }

      // Generieren Sie Kommentare für jedes Thema, das noch keine hat
      for (const topic of state.topics) {
        if (topic.comments.length === 0) {
          const comments = generateComments(3); // Generiere 3 Kommentare für jedes Thema
          commit('ADD_COMMENTS_TO_TOPIC', { topicId: topic.id, comments });
        }
      }
    },
  },
  getters: {
    // Getter zum Abrufen eines Themas anhand der ID
    getTopicById: (state) => (id) => {
      return state.topics.find((topic) => topic.id === id);
    },
    // Getter zum Abrufen des Benutzerprofils
    getUserProfile: (state) => {
      return state.user;
    },
    // Getter zum Abrufen eines Kommentars anhand der ID
    getCommentById: (state) => (commentId) => {
      // Rekursive Hilfsfunktion zum Durchsuchen von Antworten
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
    
      // Durchsuchen Sie die Themen und Kommentare
      for (const topic of state.topics) {
        for (const comment of topic.comments) {
          if (comment.id === commentId) {
            return comment;
          }
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
      // Erstellt ein Array, das alle Kommentare aus allen Themen enthält
      let allComments = [];
      for (let topic of state.topics) {
        allComments = allComments.concat(topic.comments);
      }
      return allComments;
    },
  },
});
