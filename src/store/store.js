// store.js
/* eslint-disable */

import { createStore } from "vuex";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import axios from "axios";
import router from "../router/index.js";
import io from "socket.io-client";
import SocketService from "../services/SocketService.js";
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
      displayedCommentCount: 4,
      comment: null, // Comment object
      reply: null, // Reply object
      commentReplyAnzeige: 5,
      categories,
      onlineUsers: [],
      showNavbar: true,
      currentUser: {
        token: localStorage.getItem("token") || null,
      },
      isAdmin: false,
    };
  },

  mutations: {
    SET_ADMIN_STATUS(state, isAdmin) {
      state.isAdmin = isAdmin;
    },
    ADD_USER_TO_BLOCKLIST(state, userId) {
      // Check if currentUser and blocklist are defined
      if (state.currentUser && state.currentUser.blocklist) {
        const index = state.currentUser.blocklist.indexOf(userId);
        if (index === -1) {
          // User is not in the blocklist, so add them
          state.currentUser.blocklist.push(userId);
          console.log("User successfully added to the blocklist.");
        } else {
          // User is already in the blocklist, so remove them
          state.currentUser.blocklist.splice(index, 1);
          console.log("User successfully removed from the blocklist.");
        }
      }
    },

    deleteComment(state, commentToDelete) {
      state.comments = state.comments.filter(
        (comment) => comment.id !== commentToDelete.id
      );
    },

    setShowNavbar(state, value) {
      state.showNavbar = value;
    },
    SET_USER_ONLINE(state, userId) {
      const user = state.users.find((u) => u.id === userId);
      if (user) {
        user.online = true;
      }
    },

    setTopics(state, topics) {
      state.topics = topics;
    },

    register_request(state) {
      state.status = "loading"; // You can set any loading state here if needed
    },

    register_success(state, { user, token }) {
      state.status = "success";
      state.currentUser = user;
      localStorage.setItem("user", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      state.user = user; // You can store the registered user data here if needed
    },

    register_error(state) {
      state.status = "error"; // You can set an error state here if needed
    },

    auth_request(state) {
      state.status = "loading";
    },
    auth_logout(state) {
      try {
        delete axios.defaults.headers.common["Authorization"];
        localStorage.removeItem("CurrentUser");
        localStorage.removeItem("user");
        state.currentUser = null;
        router.push("/login")
      } catch (err) {
        console.log(err);
      }
    },

    auth_success(state, user) {
      state.status = "success";
      state.currentUser = user;
      localStorage.setItem("user", JSON.stringify(user));
      axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
             SocketService.init(user.id);
    },

    auth_error(state) {
      state.status = "error";
    },
    setUsers(state, payload) {
      const { users, userData } = payload;

      // Aktualisieren Sie die Benutzerliste im State
      state.users = users;

      // Finden Sie den Index des aktuellen Benutzers in der Liste
      if (userData?.id) {
              const userIndex = users.findIndex(
                (user) => user.id === userData.id
              );

              if (userIndex !== -1) {
                // Aktualisieren Sie den aktuellen Benutzer, ohne seine bestehenden Eigenschaften zu überschreiben
                state.currentUser = {
                  ...state.currentUser,
                  ...users[userIndex],
                };
              } else {
                console.error("Benutzer mit der angegebenen ID nicht gefunden");
              }
      }

      else {
        console.log("noch nicht eingeloggd")
      }

      // Weitere Logik für ungelesene Benachrichtigungen usw.
    },

    updateCurrentUser(state, payload) {
      state.currentUser = { ...state.currentUser, ...payload };
    },

    ADD_NOTIFICATION(state, notification) {
      state.notifications.push(notification);
    },

    resetDisplayedCommentCount(state) {
      state.displayedCommentCount = 4; // Set it to the desired initial value
    },
    incrementDisplayedCommentCount(state, incrementAmount) {
      state.displayedCommentCount += incrementAmount;
    },

    // Login mutation
    setSessionId(state, sessionId) {
      state.sessionId = sessionId;
    },

    SET_SELECTED_TAB_COLOR(state, color) {
      console.log("colorMutation: ", color);
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
      const selectedTabColor = state.selectedTab === "pro" ? "green" : "red";
      sessionStorage.setItem("selectedTab", tab);
      sessionStorage.setItem("selectedTabColor", selectedTabColor);
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
      const currentUser = state.currentUser;
      // Füge die neue Antwort zum Kommentar hinzu
      if (!comment.replies) {
        comment.replies = [];
      }
      comment.expandReplies = true;
      comment.replies.push(newReply);
      currentUser.nestedReplies.push(newReply.path);
    },

    ADD_REPLY(state, { reply, newReply }) {
      const currentUser = state.currentUser;
      if (!reply.replies) {
        reply.replies = [];
      }
      reply.replies.push(newReply);
      currentUser.nestedReplies.push(newReply.path);
    },

    ADD_NOTIFICATION_TO_USER(state, notificationsObjekt) {
      try {
        console.log(notificationsObjekt);
        const user = state.users.find(
          (user) => user.id === notificationsObjekt.zielId
        );
        if (!user) {
          throw new Error(
            `User with ID ${notificationsObjekt.zielId} not found.`
          );
        }
        user.notifications.push(notificationsObjekt);
      } catch (error) {
        console.error("Error adding notification to user:", error);
      }
    },
    UPDATE_ALL_READ(state, payload) {
      const { readArray, currentUserId } = payload;
      try {
        const user = state.users.find((user) => user.id === currentUserId);
        // Überprüfen Sie, ob der Benutzer gefunden wurde und ob er ein notifications-Array hat
        if (!user) {
          throw new Error(`User with ID ${currentUserId} not found.`);
        }
        if (!user.notifications || !Array.isArray(user.notifications)) {
          throw new Error(
            `User with ID ${currentUserId} does not have a valid notifications array.`
          );
        }
        if (readArray.length > 0) {
          user.notifications.forEach((element) => {
            if (readArray.includes(element.messageId)) {
              element.read = true;
            } else {
            }
          });
        } else {
        }
      } catch (error) {
        console.error("Error updating notification read status:", error);
      }
    },

    UPDATE_READ(state, payload) {
      try {
        const notification = state.currentUser.notifications.find(
          (notif) => notif.messageId === payload.messageId
        );
        if (!notification) {
          throw new Error(
            `Notification with ID ${payload.messageId} not found.`
          );
        } else {
          notification.read = true;
        }

        // Überprüfen Sie, ob noch ungelesene Benachrichtigungen vorhanden sind
        const hasUnread = state.currentUser.notifications.some(
          (notif) => !notif.read
        );

        // Setzen Sie den Status entsprechend
        state.currentUser.hasUnreadNotifications = hasUnread;
      } catch (error) {
        console.error("Error updating notification read status:", error);
      }
    },

    SET_AKTIVE_CHATS(state, payload) {
      try {
        state.chats = payload;
      } catch (error) {
        console.error("Fehler beim Setzen der aktiven Chats:", error);
      }
    },

    CREATE_CHAT(state, payload) {
      const currentUserObjekt = state.currentUser;
      console.log(payload);
      try {
        currentUserObjekt.activeChats.push(payload.chat.chatId);
        state.chats.push(payload.chat);
      } catch (error) {
        console.log(
          "Beim hinzufügen in den State ist ein fehler aufgetreten: ",
          error
        );
      }
    },
    ADD_MESSAGE(state, message) {
      console.log("bruder");
      const chats = state.chats;
      try {
        const currentChat = chats.find((chat) => chat.chatId == message.chatId);
        if (!currentChat) {
          console.log("currentChat nicht gefunden");
        } else {
          currentChat.messages.push(message);
        }
      } catch (error) {}
    },

    UPDATE_READCHAT(state, payload) {
      console.log(payload, " payload");
      const chats = state.chats;
      try {
        const currentChat = chats.find(
          (chat) => chat.chatId === payload.chatId
        );
        if (!currentChat) {
          console.log("Chats nicht gefunden");
        } else {
          currentChat.read = true;
        }
      } catch (error) {
        console.error("Fehler beim aktualisieren des Chatreads", error.message);
      }
    },
    ADD_CHAT(state, chat) {
      state.chats.push(chat);
    },
    REMOVE_CHAT(state, payload) {
      console.log("hallo");
      console.log(payload);
      const currentUserId = payload.currentUserId;
      console.log(currentUserId);
      try {
        const currentUser = state.currentUser;
        const chatId = payload.chatId;

        if (!currentUser) {
          throw new Error("Der User wurde nicht gefunden", currentUser);
        } else {
          currentUser.activeChats = currentUser.activeChats.filter(
            (chat) => chat !== chatId
          );
          state.chats = state.chats.filter((chat) => chat.chatId !== chatId);
        }
      } catch (error) {
        console.error("Ein fehler ist aufgetreten ", error);
      }
    },

    UPDATE_CHATARRAY(state, chatId) {
      console.log("vorher: ", state.currentUser.activeChats);
      state.currentUser.activeChats.push(chatId);
      console.log("nacher: ", state.currentUser.activeChats);
    },

    ACCEPT_REQUEST(state, chatId) {
      const chat = state.chats.find((chat) => chat.chatId == chatId);
      chat.isPending = false;
    },
    UPDATE_BIO(state, payload) {
      const { editableBiOhneValue, userId } = payload;

      try {
        const chat = state.users.find((user) => (user.id = userId));
        if (!chat) {
          console.error("Something went wrong");
        } else {
          chat.bio = editableBiOhneValue;
          console.log("erfolgreich");
        }
      } catch (error) {}
    },
  },

  actions: {
    async checkAdmin() {
      try {
        console.log("check admin vor api call");
        const response = await axios.get(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/check-admin"
        );
        console.log("check admin nach api call");
        if (response.data.isAdmin) {
          // User is an admin
          this.$store.commit("SET_ADMIN_STATUS", true); // Commit the mutation
        }
      } catch (error) {
        // Handle any errors, e.g., show an error message
        console.error("Error checking admin status:", error);
      }
    },

    blockUser({ commit }, userId) {
      // Perform an API call or other necessary logic to add the user to the blocklist.
      // Replace this with your actual implementation.

      // Simulate blocking the user by adding them to the blocklist.
      commit("ADD_USER_TO_BLOCKLIST", userId);
    },

    async deleteComment({ commit, state }, commentToDelete) {
      try {
        // Make an HTTP DELETE request to your server to delete the comment
        await axios.delete(`/api/comments/${commentToDelete.id}`);

        // If the deletion was successful on the server, commit the mutation
        commit("deleteComment", commentToDelete);
      } catch (error) {
        // Handle any errors that occur during the HTTP request (e.g., network errors)
        console.error("Error deleting comment:", error);
      }
    },

    async updateBio({ commit, state }, payload) {
      console.log("payload: ", payload);
      const user = state.users.find((user) => (user.id = payload.userId));
      if (!user) {
        console.error("User nicht gefunden");
      }
      try {
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/updateBio",
          payload
        );
        if (response.status === 200 && response.data.success) {
          commit("UPDATE_BIO", payload);
        } else {
          throw new Error(
            response.data.message || "Ein unbekannter Fehler ist aufgetreten."
          );
        }
      } catch (error) {
        console.error(
          "Fehler beim Aktualisieren des Benutzers:",
          error.message
        );
      }
    },

    initializeStore({ commit }) {
      const savedTab = sessionStorage.getItem("selectedTab");
      const savedTabColor = sessionStorage.getItem("selectedTabColor");
      console.log("color1: ", savedTabColor);
      if (savedTab) {
        commit("SET_SELECTED_TAB", savedTab); // Lädt den Tab aus dem Local Storage
      }
      if (savedTabColor) {
        console.log("color: ", savedTabColor);
        commit("SET_SELECTED_TAB_COLOR", savedTabColor);
      }
    },
    async updateActiveChats({ commit, state }, chatId) {
      const currentUserId = state.currentUser.id;
      const payload = { chatId, currentUserId };
      try {
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/updatechatsid",
          payload
        );
        if (response.status === 200 && response.data.success) {
          console.log("erfolgreich updated");
        } else {
          throw new Error(
            response.data.message || "Ein unbekannter Fehler ist aufgetreten."
          );
        }
      } catch (error) {
        console.error(
          "Fehler beim Aktualisieren des Benutzers:",
          error.message
        );
      }
    },

    async removeChat({ commit, state }, payload) {
      console.log(payload);
      try {
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/removeChat",
          payload
        );
        if (response.status === 200 && response.data.success) {
          commit("REMOVE_CHAT", payload);
        } else {
          throw new Error(
            response.data.message || "Ein unbekannter Fehler ist aufgetreten."
          );
        }
      } catch (error) {
        console.error(
          "Fehler beim Aktualisieren des Benutzers:",
          error.message
        );
      }
    },

    async checkAndFetchChat({ state, commit }, chatId) {
      // Überprüfen, ob der Chat bereits im Zustand vorhanden ist
      const chatExists = state.chats.some((chat) => chat.chatId === chatId);

      if (!chatExists) {
        try {
          // Fetch den Chat vom Server
          const response = await axios.get(
            `https://c964nzv2-3000.euw.devtunnels.ms/chats/${chatId}`
          );
          const chat = response.data;

          // Führen Sie die Mutation aus, um den Chat zum Zustand hinzuzufügen
          commit("ADD_CHAT", chat);
        } catch (error) {
          console.error("Fehler beim Fetchen des Chats:", error);
          // Weitere Fehlerbehandlung hier
        }
      }
    },

    async readChat({ commit }, payload) {
      try {
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/updatereadChat",
          payload
        );
        if (response.status === 200 && response.data.success) {
          console.log("response.data_: ", response.data.message);
          commit("UPDATE_READCHAT", payload);
        } else {
          throw new Error(
            response.data.message || "Ein unbekannter Fehler ist aufgetreten."
          );
        }
      } catch (error) {
        console.error("Fehler beim Aktualisieren des reads:", error.message);
      }
    },

    async updateCurrentUserAction({ commit }, payload) {
      try {
        // Extrahieren Sie die benötigten Daten aus dem Payload
        const { filterSettings, currentUserId } = payload;

        console.log(filterSettings);
        console.log(currentUserId);
        // Senden Sie die Daten an den API-Endpunkt
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/addFilterUser",
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

    fetchOnlineUsers({ commit }) {
      axios
        .get("https://c964nzv2-3000.euw.devtunnels.ms/api/online-status")
        .then((response) => {
          const onlineUserIds = response.data; // Angenommen, die API gibt eine Liste von Benutzer-IDs zurück

          onlineUserIds.forEach((userId) => {
            commit("SET_USER_ONLINE", userId);
          });
        })
        .catch((error) => {
          console.error("Error fetching online users:", error);
        });
    },

    async createChat({ commit }, payload) {
      console.log(payload, " Moruk");
      try {
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/createchat",
          payload
        );
        if (response.status === 200) {
          payload.chat = response.data.chat;
          console.log("payload mit chatId: ", payload);
          commit("CREATE_CHAT", payload);
          return response.data.chat; // Hier geben Sie den Chat zurück
        } else {
          throw new Error(
            response.data.message || "Ein unbekannter Fehler ist aufgetreten."
          );
        }
      } catch (error) {
        console.error("Fehler beim Aktualisieren des reads:", error.message);
        throw error; // Werfen Sie den Fehler, damit er im catch-Block des Dispatch-Aufrufs erfasst werden kann
      }
    },
    async readAllUnreadNotifications({ commit }, payload) {
      try {
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/updateAllRead",
          payload
        );
        if (response.status === 200 && response.data.success) {
          commit("UPDATE_ALL_READ", payload);
        } else {
          throw new Error(
            response.data.message || "Ein unbekannter Fehler ist aufgetreten."
          );
        }
      } catch (error) {
        console.error("Fehler beim Aktualisieren des reads:", error.message);
      }
    },

    async updateRead({ commit }, payload) {
      // Im payload ist : currentUserID und isUnread

      try {
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/updateRead",
          payload
        );
        if (response.status === 200 && response.data.success) {
          commit("UPDATE_READ", payload);
        } else {
          throw new Error(
            response.data.message || "Ein unbekannter Fehler ist aufgetreten."
          );
        }
      } catch (error) {
        console.error("Fehler beim Aktualisieren des reads:", error.message);
      }
    },

    async toggleDislikeAction({ commit, dispatch, state }, payload) {
      console.log(" payload aciton: ", payload);
      const userProfile = state.users.find(
        (user) => user.id === payload.userId
      );
      console.log(userProfile + " userprofile");
      const isAlreadyLiked = userProfile.hasdislikedtopic.includes(
        payload.topicId
      );
      console.log(isAlreadyLiked + " is liked");
      try {
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/topicdislike",
          payload
        );
        if (response.status === 200 && response.data.success) {
          commit("TOGGLE_DISLIKE", payload);
        } else {
          throw new Error(
            response.data.message || "Ein unbekannter Fehler ist aufgetreten."
          );
        }
      } catch (error) {
        console.error("Fehler beim Aktualisieren des Dislikes:", error.message);
      }
      if (!isAlreadyLiked) {
        try {
          await dispatch("sendNotification", {
            userId: payload.userId,
            message: "Ihr Thema wurde disliked!",
            notificationType: payload.notificationType,
            zielId: payload.zielId,
            benachrichtigungsElementId: payload.benachrichtigungsElementId,
          });
        } catch (error) {
          console.error("Fehler beim Senden der Benachrichtigung:", error);
        }
      }
    },

    async toggleLikeAction({ commit, dispatch, state }, payload) {
      console.log(payload);

      const userProfile = state.users.find(
        (user) => user.id === payload.userId
      );
      console.log(userProfile + " userprofile");
      const isAlreadyLiked = userProfile.haslikedtopic.includes(
        payload.topicId
      );
      console.log(isAlreadyLiked + " is liked");
      // Hier können Sie zusätzliche Logik oder API-Aufrufe hinzufügen, falls erforderlich
      try {
        const response = await axios.patch(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/topiclike",
          payload
        );
        if (response.status === 200 && response.data.success) {
          commit("TOGGLE_LIKE", payload);
        } else {
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
      console.log(payload.zielId);
      if (!isAlreadyLiked) {
        try {
          await dispatch("sendNotification", {
            userId: payload.userId,
            message: "Ihr Thema wurde geliked!",
            notificationType: payload.notificationType,
            zielId: payload.zielId,
            benachrichtigungsElementId: payload.benachrichtigungsElementId,
          });
        } catch (error) {
          console.error("Fehler beim Senden der Benachrichtigung:", error);
        }
      }
    },
    async sendNotification(
      { commit },
      {
        userId,
        message,
        notificationType,
        zielId,
        benachrichtigungsElementId,
        topicId,
      }
    ) {
      try {
        const response = await fetch(
          "https://c964nzv2-3000.euw.devtunnels.ms/send-notification",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userId,
              message: message,
              notificationType: notificationType,
              benachrichtigungsElementId: benachrichtigungsElementId,
              zielId: zielId,
              topicId: topicId,
            }),
          }
        );

        if (!response.ok) {
          console.log(response);
          throw new Error("Netzwerkantwort war nicht ok.");
        }

        const data = await response.json();
        console.log("Benachrichtigung gesendet:", data);
        if (data.message === "Benachrichtigung bereits gesendet") {
          console.log("Benachrichtigung wurde bereits gesendet.");
          return; // Beendet die Funktion frühzeitig
        }
      } catch (error) {
        console.error(
          "Es gab einen Fehler beim Senden der Benachrichtigung:",
          error
        );
        // Hier können Sie weitere Aktionen durchführen, z.B. einen Fehlerstatus setzen
      }
    },

    async addReplyPathToUser({ commit }, { userId, replyPath }) {
      try {
        const response = await axios.put(
          `https://c964nzv2-3000.euw.devtunnels.ms/api/users/${userId}/addReplyPath`,
          { replyPath }
        );

        if (response.data && response.data.success) {
        }
      } catch (error) {
        console.error("Fehler beim Hinzufügen des Reply-Pfads:", error);
      }
    },

    async submitReply({ state, commit, dispatch }, payload) {
      const { reply, newReply } = payload;
      const currentUser = state.currentUser;
      try {
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/replies",
          newReply
        );
        if (response.data && response.data.success) {
          commit("ADD_REPLY", { reply, newReply });
          await dispatch("addReplyPathToUser", {
            userId: currentUser.id,
            replyPath: newReply.path,
          });
          await dispatch("sendNotification", {
            userId: payload.userId,
            message: "Ihr Thema wurde geliked!",
            notificationType: payload.notificationType,
            zielId: payload.zielId,
            benachrichtigungsElementId: payload.benachrichtigungsElementId,
            topicId: payload.topicId,
          });
        }
      } catch (error) {
        console.error("Fehler beim Senden der Antwort an den Server:", error);
      }
    },

    async addReplyAction({ commit, dispatch, state }, payload) {
      const { newReply, comment } = payload;
      try {
        // Simuliere den Serveraufruf
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/addReply",
          newReply
        );
        const antwort = response.data;
        console.log(newReply.path);
        console.log(response.data.success);
        // Überprüfe die Serverantwort
        if (response.data && response.data.success) {
          // Commit der Mutation, um die Antwort zum Kommentar hinzuzufügen

          // Hier könnten Sie den Aufruf zum Hinzufügen des Replies zum Benutzerprofil einfügen
          const userReplyResponse = await axios.post(
            "https://c964nzv2-3000.euw.devtunnels.ms/api/addUserReply",
            {
              comment,
              reply: newReply,
            }
          );

          if (userReplyResponse.data && userReplyResponse.data.success) {
            console.log("Reply erfolgreich zum Benutzerprofil hinzugefügt");

            commit("addReplyMutation", { newReply, comment });

            await dispatch("sendNotification", {
              userId: payload.userId,
              message: "Auf Ihr Kommentar wurde geantworted!",
              notificationType: payload.notificationType,
              zielId: payload.zielId,
              topicId: payload.topicId,
              benachrichtigungsElementId: payload.benachrichtigungsElementId,
            });
          } else {
            console.error(
              "Fehler beim Hinzufügen des Replies zum Benutzerprofil"
            );
          }
        } else {
          throw new Error(
            response.dACCEPT_REQUESTata.error ||
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

    async acceptRequest({ commit, state }, chatId) {
      console.log(chatId, " : Actions");
      try {
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/acceptRequest",
          { chatId: chatId }
        );
        if (response.data.success == true) {
          commit("ACCEPT_REQUEST", chatId);
        } else {
          console.log("failed " + response.data.error);
        }
      } catch (error) {
        console.error(error.message + ": ", error);
      }
    },

    async fetchUsers({ commit, state }, payload) {
      try {
        const userData = payload;
        console.log("currentuserId: ", userData);
        const response = await axios.get(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/users"
        );
        const users = response.data;
        commit("setUsers", { users, userData });
        console.log(" response.data ", response.data);
        const currentUserChats = state.currentUser.activeChats;
        console.log("amj: ", state.currentUser);

        const responseChats = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/chats",
          { currentUserChats: currentUserChats }
        );
        if (responseChats.data.success == true) {
          commit("SET_AKTIVE_CHATS", responseChats.data.chats);
        } else {
          console.log("failed " + resonse.data.error);
        }
      } catch (error) {
        console.error("Fehler beim Abrufen der Daten:", error);
      }
    },

    logout({ commit }) {
      console.log("logout");
      router.push("/login");
      commit("updateCurrentUser", { token: null });
      commit("auth_logout");
    },

    async login({ commit, getters, dispatch }, user) {
      commit("auth_request");

      try {
        console.log(user);
        let res = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/users/login",
          user
        );
        // ...

        if (res.status === 200 && res.data.success) {
          console.log("token: ", res.data.token);
          console.log(res.data);
          await dispatch("fetchTopics");

          await dispatch("initializeStore");
          console.log(res.data);
          const token = res.data.token;
          const userId = res.data.userId; // Get the userId from the response
          console.log(userId);
          const user = getters.getUserById(userId);
          console.log(user);
          user.token = token;
          commit("auth_success", user)
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

    async register({ commit }, userData) {
      try {
        commit("register_request");
        let res = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/users/register",
          userData
        );
        if (res.data.success) {
          const user = res.data.user;
          const token = res.data.token;
          const payload = {
            user: user,
            token: token,
          };
          console.log(
            res.data.user + " User objekt" + res.data.token + " Token"
          );
          commit("register_success", payload);
        } else {
          commit(
            "register_error",
            res.data.message || "An error occurred while registering."
          );
        }

        return res;
      } catch (err) {
        commit(
          "register_error",
          err.message || "An error occurred while registering."
        );
        throw err; // Rethrow the error for further handling in the component
      }
    },

    async fetchTopics({ commit }) {
      try {
        const response = await axios.get(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/topics"
        );
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

      try {
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/addTopicToSaves",
          { path: path, currentUserId: currentUserId }
        );

        if (response.data.success === true) {
          commit("ADD_TOPIC_TO_SAVES", path);
        } else {
          console.log("Fehler: " + response.data.error);
        }
      } catch (error) {
        console.error("Fehler beim Hinzufügen des Themas:", error);
        // Hier können Sie zusätzliche Fehlerbehandlung hinzufügen, falls benötigt.
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

    async upvoteComment({ commit, dispatch, state }, payload) {
      console.log(payload);
      const userProfile = state.users.find(
        (user) => user.id === payload.currentUserId
      );
      try {
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/commentupvote",
          payload
        );
        const isAlreadyLiked = userProfile.haslikedcomment.includes(
          payload.commentId
        );
        if (response.status === 200 && response.data.success) {
          commit("UPVOTE_COMMENT", payload);
        } else {
          throw new Error(
            response.data.message || "Ein unbekannter Fehler ist aufgetreten."
          );
        }
        console.log(isAlreadyLiked);
        if (!isAlreadyLiked) {
          try {
            await dispatch("sendNotification", {
              userId: payload.currentUserId,
              message: "Ihr Kommentar wurde upvoted!",
              notificationType: payload.notificationType,
              zielId: payload.zielId,
              benachrichtigungsElementId: payload.benachrichtigungsElementId,
            });
          } catch (error) {
            console.error("Fehler beim Senden der Benachrichtigung:", error);
          }
        }
      } catch (error) {
        console.error("Fehler beim Hochwerten des Kommentars:", error.message);
        // Optional: Sie könnten hier auch einen Zustand setzen, um den Fehler im UI anzuzeigen
      }
    },

    async downvoteComment({ commit, dispatch, state }, payload) {
      console.log("kolleg : ", payload);
      const userProfile = state.users.find(
        (user) => user.id === payload.currentUserId
      );
      const isAlreadyLiked = userProfile.hasdislikedcomment.includes(
        payload.commentId
      );
      console.log(isAlreadyLiked);
      try {
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/commentdownvote",
          payload
        );
        if (response.status === 200 && response.data.success) {
          commit("DOWNVOTE_COMMENT", payload);
        } else {
          throw new Error(
            response.data.message || "Ein unbekannter Fehler ist aufgetreten."
          );
        }
        if (!isAlreadyLiked) {
          try {
            await dispatch("sendNotification", {
              userId: payload.currentUserId,
              message: "Ihr Kommentar wurde downvoted",
              notificationType: payload.notificationType,
              zielId: payload.zielId,
              benachrichtigungsElementId: payload.benachrichtigungsElementId,
            });
          } catch (error) {
            console.error("Fehler beim Senden der Benachrichtigung:", error);
          }
        }
      } catch (error) {
        console.error("Fehler beim Herabwerten des Kommentars:", error.message);
      }
    },
    async upvoteReply({ commit, dispatch, state }, payload) {
      console.log(payload);
      const userProfile = state.users.find(
        (user) => user.id === payload.currentUserId
      );
      const isAlreadyLiked = userProfile.haslikedreply.includes(
        payload.replyId
      );
      console.log(isAlreadyLiked);
      try {
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/replyupvote",
          payload
        );
        if (response.status === 200 && response.data.success) {
          commit("UPVOTE_REPLY", payload);
        } else {
          throw new Error(
            response.data.message || "Ein unbekannter Fehler ist aufgetreten."
          );
        }
      } catch (error) {
        console.error("Fehler beim Hochwerten der Antwort:", error.message);
      }
      if (!isAlreadyLiked) {
        try {
          await dispatch("sendNotification", {
            userId: payload.currentUserId,
            message: "Ihre Antwort wurde upvoted",
            notificationType: payload.notificationType,
            zielId: payload.zielId,
            benachrichtigungsElementId: payload.benachrichtigungsElementId,
            topicId: payload.topicId,
          });
        } catch (error) {
          console.error("Fehler beim Senden der Benachrichtigung:", error);
        }
      }
    },
    async downvoteReply({ commit, dispatch, state }, payload) {
      console.log(payload);
      const userProfile = state.users.find(
        (user) => user.id === payload.currentUserId
      );
      const isAlreadyLiked = userProfile.hasdislikedreply.includes(
        payload.replyId
      );
      try {
        console.log(isAlreadyLiked);
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/replydownvote",
          payload
        );
        if (response.status === 200 && response.data.success) {
          commit("DOWNVOTE_REPLY", payload);
        } else {
          throw new Error(
            response.data.message || "Ein unbekannter Fehler ist aufgetreten."
          );
        }
      } catch (error) {
        console.error("Fehler beim Herunterwerten der Antwort:", error.message);
      }
      if (!isAlreadyLiked) {
        try {
          await dispatch("sendNotification", {
            userId: payload.currentUserId,
            message: "Ihre Antwort wurde upvoted",
            notificationType: payload.notificationType,
            zielId: payload.zielId,
            benachrichtigungsElementId: payload.benachrichtigungsElementId,
            topicId: payload.topicId,
          });
        } catch (error) {
          console.error("Fehler beim Senden der Benachrichtigung:", error);
        }
      }
    },

    async fetchTopic({ commit }, topicId) {
      try {
        console.log(topicId);
        const response = await axios.get(
          `https://c964nzv2-3000.euw.devtunnels.ms/api/topics/${topicId}`
        );
        const topicData = response.data;
        console.log(topicData);
        commit("SET_SINGLE_TOPIC", topicData);
      } catch (error) {
        console.error("Fehler beim Abrufen des Themas:", error);
        throw error;
      }
    },

    async addCommentToTopic({ commit, dispatch, state }, payload) {
      const { author, topicId, comment, selectedTab } = payload;
      console.log(payload, " store");

      try {
        const response = await axios.post(
          "https://c964nzv2-3000.euw.devtunnels.ms/api/addComment",
          payload
        );

        if (response.status !== 200) {
          throw new Error(
            response.data.message || "Fehler beim Hinzufügen des Kommentars."
          );
        }

        await dispatch("sendNotification", {
          userId: payload.userId,
          message: "Sie haben einen neuen Kommentar",
          notificationType: payload.notificationType,
          zielId: payload.zielId,
          benachrichtigungsElementId: payload.benachrichtigungsElementId,
          topicId: payload.topicId,
        });

        commit("ADD_COMMENT_TO_TOPIC", {
          author,
          topicId,
          comment,
          selectedTab,
        });
      } catch (error) {
        console.error("Fehler:", error.message);
        // Hier können Sie weiteren Code hinzufügen, um den Fehler z.B. im Zustand zu speichern oder den Benutzer zu informieren.
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
  computed: {
    isAdmin() {
      return this.$store.state.isAdmin;
    },
  },
});
