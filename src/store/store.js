// store.js
/* eslint-disable */

import { createStore } from "vuex";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import axios from "axios";
import Auth from "../expressjs/auth";


/* eslint-disable no-unused-vars */

export function formatCreatedAt(createdAt) {
  const createdAtDate = dayjs(createdAt);
  const now = dayjs();

  const diff = now.diff(createdAtDate, "minute");

  if (diff < 1) {
    return "Now";
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
const MAX_COMMENT_POSITION = 100;



function setDepthForReplies(replies, depth) {
  if (!replies || !Array.isArray(replies) || replies.length === 0) {
    return;
  }

  for (let reply of replies) {
    console.log("Setting depth for reply:", reply, "to", depth); // Debugging-Statement
    reply.depth = depth;
    setDepthForReplies(reply.replies, depth + 1);
  }
}

function setDepthForTopics(topics) {
  for (let topic of topics) {
    setDepthForReplies(topic.contraComments, 0); // Starttiefe ist 1
    setDepthForReplies(topic.proComments, 0); // Starttiefe ist 1
  }
}






function isCommentPositionAvailable(state, topicId, selectedTab) {
  const topic = state.topics.find((topic) => topic.id === topicId);
  if (topic) {
    const commentsArray =
      selectedTab === "contra" ? topic.contraComments : topic.proComments;
    return commentsArray.length < MAX_COMMENT_POSITION; // MAX_COMMENT_POSITION ist die maximale Anzahl von Kommentaren
  }
  return false;
}

function setAuthHeader(token) {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
}

function updatePercentages(topic) {
  const totalVotes = topic.upvotes + topic.downvotes;
  topic.upvotePercentage = ((topic.upvotes / totalVotes) * 100).toFixed(2);
  topic.downvotePercentage = ((topic.downvotes / totalVotes) * 100).toFixed(2);
}

function searchCommentInArray(comments, commentId) {
  for (const currentComment of comments) {
    if (currentComment.id === commentId) {
      return currentComment;
    }
    if (currentComment.replies) {
      const foundReply = searchCommentInArray(
        currentComment.replies,
        commentId
      );
      if (foundReply) {
        return foundReply;
      }
    }
  }
  return null;
}

function numberReplies(replies, path = "") {
  replies.forEach((reply, index) => {
    const newPath = `${path}/${index}`;
    reply.path = `${reply.Commentpath}${newPath}`;
    reply.authorPath = reply.author.nestedReplies.push(reply.path);
    if (reply.replies.length > 0) {
      reply.replies = numberReplies(reply.replies, newPath);
    }
  });
  return replies;
}

function generateFakeProfileImage(name) {
  return `https://fakeimg.pl/50x50/?text=${name[0]}&font=lobster`;
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

  modules: {
    Auth,
  },

  state() {
    const categories = [
      { main: "Sport", sub: "Fussball" },
      { main: "Technologie", sub: "Programmierung" },
      { main: "Unterhaltung", sub: "Film" },
      { main: "Technologie", sub: "Gaming" },
      { main: "Reisen", sub: "Abenteuer" },
      { main: "Kunst", sub: "Malerei" },
      { main: "Gesundheit", sub: "Fitness" },
      { main: "Musik", sub: "Rock" },
      { main: "Essen", sub: "Italienisch" },
      { main: "Wissenschaft", sub: "Astronomie" },
      { main: "Bücher", sub: "Fantasy" },
      { main: "Auto", sub: "Elektrofahrzeuge" },
      { main: "Mode", sub: "Schuhe" },
      { main: "Reisen", sub: "Strandurlaub" },
      { main: "Gesundheit", sub: "Meditation" },
      { main: "Musik", sub: "Klassik" },
      { main: "Sport", sub: "Basketball" },
      { main: "Technologie", sub: "Künstliche Intelligenz" },
      { main: "Bücher", sub: "Science Fiction" },
      { main: "Auto", sub: "Luxusautos" },
      { main: "Mode", sub: "Accessoires" },
      { main: "Reisen", sub: "Wandern" },
      { main: "Gesundheit", sub: "Yoga" },
      { main: "Musik", sub: "Hip-Hop" },
      { main: "Sport", sub: "Tennis" },
      { main: "Technologie", sub: "Blockchain" },
      { main: "Bücher", sub: "Krimi" },
      { main: "Auto", sub: "Oldtimer" },
      { main: "Mode", sub: "Hüte" },
      { main: "Reisen", sub: "Städtereisen" },
      { main: "Gesundheit", sub: "Ernährung" },
      { main: "Musik", sub: "Pop" },
      // Weitere Kategorien hinzufügen...
    ];
    const loggedin = "true";


    return {
      topics: [],
      users: [],
      loggedin,
      selectedTab: "pro",
      selectedTabColor: "green",
      sessionId: null,
      displayedCommentCount: 3,
      comment: null, // Comment object
      reply: null, // Reply object
      commentReplyAnzeige: 5,
      categories,
      currentUser:{
        token: localStorage.getItem("token") || null,
      }
    };
  },

  
  mutations: {
    setTopics(state, topics) {
      state.topics = topics;
      console.log("kolleg")
    },

    
    register_request(state) {
      state.status = 'loading'; // You can set any loading state here if needed
    },
  
    register_success(state, user) {
      state.status = 'success';
      state.user = user; // You can store the registered user data here if needed
    },
  
    register_error(state) {
      state.status = 'error'; // You can set an error state here if needed
    },
    
    auth_request(state) {
      state.status = 'loading';
    },
    
    auth_success(state, { token, user }) {
      state.status = "success";
      state.currentUser.token = token; // Set the user's token
      state.user = user; // Update the user data in the state
      setAuthHeader(token); // Set the Authorization header with the token
    },
    
    auth_error(state) {
      state.status = 'error';
    },

    

    setUsers(state, users) {
      state.users = users;
      state.currentUser = users[0];
    },

   

    updateCurrentUser(state, payload) {
      state.currentUser = { ...state.currentUser, ...payload };
    },

    ADD_NOTIFICATION(state, notification) {
      state.notifications.push(notification);
    },

    resetDisplayedCommentCount(state) {
      state.displayedCommentCount = 3; // Set it to the desired initial value
    },
    incrementDisplayedCommentCount(state, incrementAmount) {
      state.displayedCommentCount += incrementAmount;
    },

    // Login mutation
    setSessionId(state, sessionId) {
      state.sessionId = sessionId;
    },

    SET_SELECTED_TAB_COLOR(state, color) {
      state.selectedTabColor = color;
    },

    UPDATE_TOPIC_PERCENTAGES(state, { topicId }) {
      const topic = state.topics.find((topic) => topic.id === topicId);
      if (topic) {
        const totalVotes = topic.upvotes + topic.downvotes;
        topic.likePercentage =
          totalVotes === 0 ? 0 : Math.round((topic.upvotes / totalVotes) * 100);
        topic.dislikePercentage =
          totalVotes === 0
            ? 0
            : Math.round((topic.downvotes / totalVotes) * 100);
      }
    },

    UPVOTE_COMMENT(state, { commentId, currentUserId, topicId }) {
      const userId = currentUserId;
      const topic = state.topics.find((topic) => topic.id === topicId);
      const comment =
        topic.proComments.find((comment) => comment.id === commentId) ||
        topic.contraComments.find((topic) => topic.id === commentId);
      if (comment) {
        const user = state.users.find((user) => user.id === userId);
        if (user) {
          if (user.haslikedcomment.includes(commentId)) {
            // Wenn der Kommentar bereits geliked wurde, entferne den Like
            comment.upvotes -= 1;
            user.haslikedcomment = user.haslikedcomment.filter(
              (id) => id !== commentId
            );
          } else {
            // Wenn der Kommentar noch nicht geliked wurde, füge den Like hinzu
            if (user.hasdislikedcomment.includes(commentId)) {
              // Wenn der Benutzer den Kommentar bereits disliket hat, entferne den Dislike
              comment.downvotes -= 1;
              user.hasdislikedcomment = user.hasdislikedcomment.filter(
                (id) => id !== commentId
              );
            }
            comment.upvotes += 1;
            user.haslikedcomment.push(commentId);

            // Entferne den Dislike, falls vorhanden
          }
        }
      }
    },

    DOWNVOTE_COMMENT(state, { commentId, currentUserId, topicId }) {
      const userId = currentUserId;
      const topic = state.topics.find((topic) => topic.id === topicId);
      const comment =
        topic.proComments.find((comment) => comment.id === commentId) ||
        topic.contraComments.find((topic) => topic.id === commentId);

      if (comment) {
        const user = state.users.find((user) => user.id === userId);
        if (user) {
          if (user.hasdislikedcomment.includes(commentId)) {
            // Wenn der Kommentar bereits disliket wurde, entferne den Dislike
            comment.downvotes -= 1;
            user.hasdislikedcomment = user.hasdislikedcomment.filter(
              (id) => id !== commentId
            );
          } else {
            // Wenn der Kommentar noch nicht disliket wurde, füge den Dislike hinzu
            if (user.haslikedcomment.includes(commentId)) {
              // Wenn der Benutzer den Kommentar bereits geliked hat, entferne den Like
              comment.upvotes -= 1;
              user.haslikedcomment = user.haslikedcomment.filter(
                (id) => id !== commentId
              );
            }
            comment.downvotes += 1;
            user.hasdislikedcomment.push(commentId);
          }
        }
      }
    },

    UPVOTE_REPLY(state, { replyId, currentUserId, topicId, commentId }) {
      const topic = state.topics.find((topic) => topic.id === topicId);
      const comment =
        topic.proComments.find((comment) => comment.id === commentId) ||
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
            user.hasdislikedreply = user.hasdislikedreply.filter(
              (id) => id !== replyId
            );
          }
        } else {
          // Remove the like
          reply.upvotes -= 1;
          user.haslikedreply = user.haslikedreply.filter(
            (id) => id !== replyId
          );
        }
      }
    },

    // Hilfsfunktion, um in Kommentaren und verschachtelten Antworten zu suchen

    DOWNVOTE_REPLY(state, { replyId, currentUserId, topicId, commentId }) {
      const topic = state.topics.find((topic) => topic.id === topicId);
      const comment =
        topic.proComments.find((comment) => comment.id === commentId) ||
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
            user.haslikedreply = user.haslikedreply.filter(
              (id) => id !== replyId
            );
          }
        } else {
          // Remove the dislike
          reply.downvotes -= 1;
          user.hasdislikedreply = user.hasdislikedreply.filter(
            (id) => id !== replyId
          );
        }
      }
    },

    TOGGLE_LIKE(state, { topicId, userId }) {
      const topic = state.topics.find((topic) => topic.id === topicId);
      const user = state.users.find((user) => user.id === userId);

      if (!topic || !user) return;

      const hasLiked = user.haslikedtopic.includes(topicId);
      const hasDisliked = user.hasdislikedtopic.includes(topicId);

      if (!hasLiked) {
        topic.upvotes += 1;
        user.haslikedtopic.push(topicId);
        if (hasDisliked) {
          topic.downvotes -= 1;
          user.hasdislikedtopic = user.hasdislikedtopic.filter(
            (id) => id !== topicId
          );
        }
      } else {
        topic.upvotes -= 1;
        user.haslikedtopic = user.haslikedtopic.filter((id) => id !== topicId);
      }

      updatePercentages(topic); // Aktualisiere Prozentsätze
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

            // Entferne den Like (falls vorhanden)
            if (user.haslikedtopic.includes(topicId)) {
              topic.upvotes -= 1;
              user.haslikedtopic = user.haslikedtopic.filter(
                (id) => id !== topicId
              );
            }
          } else {
            // Entferne den Dislike
            topic.downvotes -= 1;
            user.hasdislikedtopic = user.hasdislikedtopic.filter(
              (id) => id !== topicId
            );
          }

          updatePercentages(topic); // Prozentwerte aktualisieren
        }
      }
    },

    // Kommentare
    ADD_COMMENT_TO_TOPIC(state, { author, topicId, comment, selectedTab }) {
      const user = author;
      const users = state.users;
      console.log(state.topics);
      console.log(topicId);

      const topic = state.topics.find((topic) => topic.id === topicId);
      if (topic) {
        console.log(topic);
        if (comment.text.trim() !== "") {
          // Initialize the Vote properties for the new comment
          comment.upvotes = 0;
          comment.downvotes = 0;

          if (selectedTab === "contra") {
            console.log("contra");
            comment.commentType = "contra"; // Richtiges Property verwenden
            topic.contraComments.push(comment);
            console.log("push");
            user.contracreated.push(comment.id);
          } else {
            console.log("pro");
            comment.commentType = "pro";
            topic.proComments.push(comment);
            user.procreated.push(comment.id);
          }
        } else {
          // Show a SweetAlert message if the comment is empty
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "The comment cannot be empty.",
            confirmButtonText: "OK",
          });
        }
      }
      console.log("nid gfunde amk");
    },

    ADD_TOPIC_TO_SAVES(state, topicPath) {
      if (state.currentUser) {
        const index = state.currentUser.topicsaves.indexOf(topicPath);
        if (index === -1) {
          // Thema ist noch nicht gespeichert, also hinzufügen
          state.currentUser.topicsaves.push(topicPath);
          console.log("Thema erfolgreich gespeichert.");
        } else {
          // Thema ist bereits gespeichert, also entfernen
          state.currentUser.topicsaves.splice(index, 1);
          ("Thema erfolgreich entfernt.");
        }
      }
    },

    SET_SELECTED_TAB(state, tab) {
      state.selectedTab = tab;
    },
    comment_und_reply2(state, { comment, reply }) {
      console.log("kolleg2");
      state.comment = comment;
      state.reply = reply;
    },

    SET_SINGLE_TOPIC(state, topicData) {
      const existingTopicIndex = state.topics.findIndex(
        (topic) => topic.id === topicData.id
      );

      if (existingTopicIndex !== -1) {
        // Vue 3: Direkte Aktualisierung eines Elements im Array
        console.log("hade laaan");
        state.topics[existingTopicIndex] = topicData;
      } else {
        state.topics.push(topicData);
      }
    },


    addReplyMutation(state, { newReply, comment }) {
      // Füge die neue Antwort zum Kommentar hinzu
      if (!comment.replies) {
        comment.replies = [];
      }
      comment.expandReplies = true;
      comment.replies.push(newReply);
    },

    ADD_REPLY(state, { reply, newReply }) {
      if (!reply.replies) {
        reply.replies = [];
      }
      reply.replies.push(newReply);
    },

    ADD_REPLY_PATH_TO_USER(state, { userId, replyPath }) {
      const user = state.users.find((user) => user.id === userId);
      if (user) {
        user.nestedReplies.push(replyPath);
      }
    },

  actions: {



    
    async toggleLikeAction({ commit }, payload) {
      // Hier können Sie zusätzliche Logik oder API-Aufrufe hinzufügen, falls erforderlich
      commit("TOGGLE_LIKE", payload);
    },

    async updateCurrentUserAction({ commit }, payload) {
      try {
        // Extrahieren Sie die benötigten Daten aus dem Payload
        const { filterSettings, currentUserId } = payload;

        console.log(filterSettings);
        console.log(currentUserId);
        // Senden Sie die Daten an den API-Endpunkt
        const response = await axios.post(
          "http://192.168.1.42:3000/api/addFilterUser",
          {
            filterSettings: filterSettings,
            currentUserId: currentUserId,
          }
        );

        // Überprüfen Sie den Status der Antwort
        if (response.status === 200 && response.data.success) {
          // Wenn die API-Anfrage erfolgreich war, aktualisieren Sie den Zustand
          commit("updateCurrentUser", payload);
        } else {
          // Andernfalls werfen Sie einen Fehler mit der Fehlermeldung aus der Antwort
          throw new Error(
            response.data.message || "Ein unbekannter Fehler ist aufgetreten."
          );
        }
      } catch (error) {
        // Behandeln Sie Fehler, z.B. durch das Anzeigen einer Fehlermeldung
        console.error(
          "Fehler beim Aktualisieren des Benutzers:",
          error.message
        );
        // Optional: Sie könnten hier auch einen Zustand setzen, um den Fehler im UI anzuzeigen
      }
    },

    async addReplyPathToUser({ commit }, { userId, replyPath }) {
      try {
        const response = await axios.put(
          `http://192.168.1.42:3000/api/users/${userId}/addReplyPath`,
          { replyPath }
        );

        if (response.data && response.data.success) {
        }
      } catch (error) {
        console.error("Fehler beim Hinzufügen des Reply-Pfads:", error);
      }
    },

    async submitReply({ commit }, { reply, newReply }) {
      try {
        const response = await axios.post(
          "http://192.168.1.42:3000/api/replies",
          newReply
        );
        if (response.data && response.data.success) {
          commit("ADD_REPLY", { reply, newReply });
        }
      } catch (error) {
        console.error("Fehler beim Senden der Antwort an den Server:", error);
      }
    },

    async addReplyAction({ commit }, { newReply, comment }) {
      try {
        // Simuliere den Serveraufruf
        const response = await axios.post(
          "http://192.168.1.42:3000/api/addReply",
          newReply
        );
        const antwort = response.data;
        console.log(newReply.path);
        console.log(response.data.success);
        // Überprüfe die Serverantwort
        if (response.data && response.data.success) {
          // Commit der Mutation, um die Antwort zum Kommentar hinzuzufügen
          commit("addReplyMutation", { newReply, comment });
          // Hier könnten Sie den Aufruf zum Hinzufügen des Replies zum Benutzerprofil einfügen
          const userReplyResponse = await axios.post(
            "http://192.168.1.42:3000/api/addUserReply",
            {
              comment,
              reply: newReply,
            }
          );
          if (userReplyResponse.data && userReplyResponse.data.success) {
            console.log("Reply erfolgreich zum Benutzerprofil hinzugefügt");
          } else {
            console.error(
              "Fehler beim Hinzufügen des Replies zum Benutzerprofil"
            );
          }
        } else {
          throw new Error(
            response.data.error ||
              "Unbekannter Fehler beim Hinzufügen der Antwort"
          );
        }

        // Leere das Eingabefeld und blende das Antwortformular aus
        // Dies sollte in der Komponente selbst erfolgen, z.B. durch das Auslösen eines Events oder das Setzen eines Zustands
      } catch (error) {
        console.error("Fehler beim Hinzufügen der Antwort:", error);
        // Hier kannst du auf spezifische Fehler reagieren, z.B. durch das Anzeigen einer Fehlermeldung für den Benutzer
      }
    },

    async fetchUsers({ commit }) {
      try {
        const response = await axios.get("http://192.168.1.42:3000/api/users");
        const users = response.data;
        console.log(users);
        commit("setUsers", users);
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
      }
    },

  async addReplyPathToUser({ commit }, { userId, replyPath }) {
    try {
      const response = await axios.put(`http://192.168.1.42:3000/api/users/${userId}/addReplyPath`, { replyPath });

      if (response.data && response.data.success) {
        commit("ADD_REPLY_PATH_TO_USER", { userId, replyPath });
      }
    } catch (error) {
      console.error("Fehler beim Hinzufügen des Reply-Pfads:", error);
    }
  },


    async submitReply({ commit }, { reply, newReply }) {
      try {
        const response = await axios.post(
          "http://192.168.1.42:3000/api/replies",
          newReply
        );
        if (response.data && response.data.success) {
          commit("ADD_REPLY", { reply, newReply });
        }
      } catch (error) {
        console.error("Fehler beim Senden der Antwort an den Server:", error);
      }
    },

    async addReplyAction({ commit }, { newReply, comment }) {
      try {
        // Simuliere den Serveraufruf
        const response = await axios.post(
          "http://192.168.1.42:3000/api/addReply",
          newReply
        );
        const antwort = response.data;
        console.log(newReply.path);
        console.log(response.data.success);
        // Überprüfe die Serverantwort
        if (response.data && response.data.success) {
          // Commit der Mutation, um die Antwort zum Kommentar hinzuzufügen
          commit("addReplyMutation", { newReply, comment });
          // Hier könnten Sie den Aufruf zum Hinzufügen des Replies zum Benutzerprofil einfügen
          const userReplyResponse = await axios.post(
            "http://192.168.1.42:3000/api/addUserReply",
            {
              comment,
              reply: newReply,
            }
          );
          if (userReplyResponse.data && userReplyResponse.data.success) {
            console.log("Reply erfolgreich zum Benutzerprofil hinzugefügt");
          } else {
            console.error(
              "Fehler beim Hinzufügen des Replies zum Benutzerprofil"
            );
          }
        } else {
          throw new Error(
            response.data.error ||
              "Unbekannter Fehler beim Hinzufügen der Antwort"
          );
        }

        // Leere das Eingabefeld und blende das Antwortformular aus
        // Dies sollte in der Komponente selbst erfolgen, z.B. durch das Auslösen eines Events oder das Setzen eines Zustands
      } catch (error) {
        console.error("Fehler beim Hinzufügen der Antwort:", error);
        // Hier kannst du auf spezifische Fehler reagieren, z.B. durch das Anzeigen einer Fehlermeldung für den Benutzer
      }
    },

    async fetchUsers({ commit }) {
      try {
        const response = await axios.get("http://192.168.1.42:3000/api/users");
        const users = response.data;
        console.log(users);
        commit("setUsers", users);
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
      }
    },
    

    logout({ commit }) {
      // Clear the user's token and other data
      commit("auth_logout");
      // Clear the Authorization header
      delete axios.defaults.headers.common['Authorization'];
    },


    async login({ commit }, user) {
      commit("auth_request");
      try {
        let res = await axios.post("http://localhost:3000/api/users/ldssogin", user);
        // ...
        if (res.status === 200 && res.data.success) {
          const token = res.data.token;
          const userId = res.data.userId; // Get the userId from the response
          const userData = res.data.user;
          localStorage.setItem("token", token);
          commit("auth_success", { token, user: userData });
          setAuthHeader(token); // Set the Authorization header
          return { success: true, userId };
        } else {
          commit("auth_error");
          console.log("Login unsuccessful. Response data:", res.data);
          return { success: false };
        }
      } catch (err) {
        commit("auth_error");
        console.error("Error logging in:", err);
        return { success: false };

      }
    },
    


  
    async register({
      commit
  }, userData) {
      try {
          commit('register_request');
          let res = await axios.post('http://localhost:3000/api/users/register', userData);
          if (res.data.success !== undefined) {
              commit('register_success');
          }
          return res;
      } catch (err) {
          commit('register_error', err)
      }
  },

  async fetchUsers({ commit, state }) {
    try {
      // Check if the user is authenticated (has a token)
      if (state.currentUser.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${state.currentUser.token}`;
      }
  
      const response = await axios.get("http://localhost:3000/api/users");
      const users = response.data;
      console.log(users);
      commit("setUsers", users);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  },

    async fetchTopics({ commit }) {
      try {
        const response = await axios.get("http://192.168.1.42:3000/api/topics");
        const topics = response.data;
        commit("setTopics", topics);
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
      }
    },

    commentundreply({ commit }, { comment, reply }) {
      commit("comment_und_reply2", { comment, reply });
    },
    async addtopicToSaves({ commit }, { path, currentUserId }) {
      console.log(currentUserId);
      console.log(path);
      const response = await axios.post(
        "http://192.168.1.42:3000/api/addTopicToSaves",
        { path: path, currentUserId: currentUserId }
      );
      if (response.data.success == true) {
        commit("ADD_TOPIC_TO_SAVES", path);
      } else {
        console.log("failed " + resonse.data.error);
      }
    },

    addNotification({ commit }, notification) {
      commit("ADD_NOTIFICATION", notification);
    },

    updateSelectedTabColor({ state, commit }) {
      const selectedTabColor = state.selectedTab === "pro" ? "green" : "red";
      commit("SET_SELECTED_TAB_COLOR", selectedTabColor);
    },

    selectTab({ commit }, tab) {
      commit("SET_SELECTED_TAB", tab);
    },

    updateTopicPercentages({ commit }, { topicId }) {
      commit("UPDATE_TOPIC_PERCENTAGES", { topicId });
    },

    upvoteComment({ commit }, { commentId, currentUserId, topicId }) {
      commit("UPVOTE_COMMENT", { commentId, currentUserId, topicId });
    },

    downvoteComment({ commit }, { commentId, currentUserId, topicId }) {
      commit("DOWNVOTE_COMMENT", { commentId, currentUserId, topicId });
    },

    upvoteReply({ commit }, { replyId, currentUserId, topicId, commentId }) {
      commit("UPVOTE_REPLY", { replyId, currentUserId, topicId, commentId });
    },
    downvoteReply({ commit }, { replyId, currentUserId, topicId, commentId }) {
      commit("DOWNVOTE_REPLY", { replyId, currentUserId, topicId, commentId });
    },

    async fetchTopic({ commit }, topicId) {
      try {
        console.log(topicId);
        const response = await axios.get(
          `http://192.168.1.42:3000/api/topics/${topicId}`
        );
        const topicData = response.data;
        console.log(topicData);
        commit("SET_SINGLE_TOPIC", topicData);
      } catch (error) {
        console.error("Fehler beim Abrufen des Themas:", error);
        throw error;
      }
    },

    async addCommentToTopic(
      { commit },
      { author, topicId, comment, selectedTab }
    ) {
      commit("ADD_COMMENT_TO_TOPIC", { author, topicId, comment, selectedTab });
      console.log(comment + " store");
      await axios.post("http://192.168.1.42:3000/api/addComment", comment);
    },
  },
  getters: {

    isAuthenticated: (state) => {
      return !!state.currentUser.token; // Convert the token to a boolean
    },

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

    getTopicById: (state) => (id) => {
      return state.topics.find((topic) => topic.id === id);
    },
    

    getUserById: (state) => (id) => {
      return state.users.find((user) => user.id === id);
    },

    getUserProfile: (state) => {
      return state.users[0];
    },

    getCommentById: (state) => (commentId) => {
      for (const topic of state.topics) {
        const foundProComment = searchCommentInArray(
          topic.proComments,
          commentId
        );

        if (foundProComment) {
          return foundProComment;
        }

        const foundContraComment = searchCommentInArray(
          topic.contraComments,
          commentId
        );

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
