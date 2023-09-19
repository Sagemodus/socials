// store.js
import { createStore } from "vuex";
import { v4 as uuidv4 } from "uuid";
import Swal from "sweetalert2";
import faker from "faker";
import dayjs from "dayjs";

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

function generateReplies(
  count,
  topicId,
  users,
  newComment,
  isNested = false,
  Commentpath = ""
) {
  const replies = [];

  for (let i = 0; i < count; i++) {
    const replytype = isNested ? "nested" : "reply";

    const id = faker.datatype.uuid();
    const author =
      users[faker.datatype.number({ min: 0, max: users.length - 1 })];
    const newReply = {
      id,
      topicId,
      text: faker.lorem.paragraphs(),
      author,
      upvotes: faker.datatype.number(),
      downvotes: faker.datatype.number(),
      createdAt: faker.date.past(),
      replies: generateReplies(
        count - 1,
        topicId,
        users,
        newComment,
        true,
        Commentpath
      ),
      Commentpath: Commentpath,
      expandReplies: false,
      commentobjekt: newComment,
      replytype,
    };

    replies.push(newReply);

    if (replytype === "reply") {
      author.createdReplies.push(newReply.id);
    }
  }

  replies.sort((a, b) => a.createdAt - b.createdAt);
  return replies;
}

function generateComments(count, users, topicId, commentType, path = "") {
  const comments = [];
  for (let i = 0; i < count; i++) {
    const id = faker.datatype.uuid();
    const author =
      users[faker.datatype.number({ min: 0, max: users.length - 1 })];
    const newComment = {
      id,
      topicId,
      text: faker.lorem.paragraph(),
      author,
      upvotes: faker.datatype.number(),
      downvotes: faker.datatype.number(),
      createdAt: faker.date.past(),
      commentType,
      expandReplies: false,
      showelement: true,
    };

    comments.push(newComment);
    if (commentType === "pro") {
      author.procreated.push(newComment.id);
    } else {
      author.contracreated.push(newComment.id);
    }
  }

  comments.sort((a, b) => b.upvotes - a.upvotes);
  const top3 = comments.slice(0, 3);
  const rest = comments.slice(3);

  rest.sort((a, b) => a.createdAt - b.createdAt);

  const sortedComments = top3.concat(rest);

  sortedComments.forEach((comment, index) => {
    comment.commentIndex = index;
    const newPath = `${path}/${commentType}_${comment.commentIndex}`;
    comment.path = newPath;

    comment.replies = generateReplies(
      2,
      topicId,
      users,
      comment,
      false,
      newPath
    );
    comment.replies = numberReplies(comment.replies);
  });

  return sortedComments;
}

function generateTopics(count, users, categories) {
  const topics = [];
  for (let i = 0; i < count; i++) {
    const id = faker.datatype.uuid();
    const category = faker.random.arrayElement(categories);
    const author =
      users[faker.datatype.number({ min: 0, max: users.length - 1 })];
    const newPath = `/${i}`;

    const newTopic = {
      id,
      text: faker.lorem.paragraph(),
      author: author,
      createdAt: faker.date.past(),
      upvotes: faker.datatype.number({ min: 0, max: 100 }),
      downvotes: faker.datatype.number({ min: 0, max: 100 }),
      category: category,
      proComments: [],
      contraComments: [],
      path: newPath,
    };

    const totalVotes = newTopic.upvotes + newTopic.downvotes;
    const upvotePercentage = (newTopic.upvotes / totalVotes) * 100;
    const downvotePercentage = (newTopic.downvotes / totalVotes) * 100;

    newTopic.upvotePercentage = upvotePercentage.toFixed(2);
    newTopic.downvotePercentage = downvotePercentage.toFixed(2);

    newTopic.proComments = generateComments(
      10,
      users,
      newTopic.id,
      "pro",
      newPath
    );
    newTopic.contraComments = generateComments(
      10,
      users,
      newTopic.id,
      "contra",
      newPath
    );

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
    const categories = [
      { main: "Sport", sub: "Fussball" },
      { main: "Technologie", sub: "Programmierung" },
      { main: "Unterhaltung", sub: "Film" },
      { main: "Technologie", sub: "Gaming" },
      // Weitere Kategorien hinzufügen...
    ];
    const loggedin = "true";
    const users = [
      {
        id: 1,
        name: "Dejan Pantos",
        profileImage: generateFakeProfileImage("Dejan Pantos"),
        farbe: "4",
        tweets: [0], // Liste der Tweets des Benutzers
        procreated: [],
        contracreated: [],
        haslikedcomment: [],
        hasdislikedcomment: [],
        haslikedreply: [],
        hasdislikedreply: [],
        haslikedtopic: [],
        hasdislikedtopic: [],
        following: [15, 16],
        followers: [18, 25, 27], // Liste der Follower des Benutzerspro
        notifications: [], // Benachrichtigungen für den Benutzer
        messages: [], // Privatnachrichten des Benutzers
        topicsaves: ["/0"],
        nestedReplies: [],
        createdReplies: [],
        filterSettings: {
          // Andere Einstellungen
          categories: [], // Ein leeres Array für ausgewählte Kategorien
        },

        joinedAt: "28.08.2023",
        email: "dejan.pantos@maschene.com",
        bio: "King of the street",
      },
      {
        id: 2,
        name: "Lionel Messi",
        profileImage: generateFakeProfileImage("Lionel Messi"),
        farbe: "4",
        tweets: [], // Liste der Tweets des Benutzers1
        createdReplies: [],
        procreated: [],
        contracreated: [],
        haslikedcomment: [],
        hasdislikedcomment: [],
        haslikedreply: [],
        hasdislikedreply: [],
        haslikedtopic: [],
        hasdislikedtopic: [],
        following: [15, 16],
        followers: [18, 25, 27], // Liste der Follower des Benutzerspro
        notifications: [], // Benachrichtigungen für den Benutzer
        messages: [], // Privatnachrichten des Benutzers
        topicsaves: ["/0"],
        nestedReplies: [],

        filterSettings: {
          // Andere Einstellungen
          categories: [], // Ein leeres Array für ausgewählte Kategorien
        },
        joinedAt: "28.08.2023",
        email: "dejan.pantos@maschene.com",
        bio: "King of the street",
      },
      {
        id: 3,
        name: "Son Goku",
        profileImage: generateFakeProfileImage("Son Goku"),
        farbe: "4",
        tweets: [], // Liste der Tweets des Benutzers1
        createdReplies: [],
        procreated: [],
        contracreated: [],
        haslikedcomment: [],
        hasdislikedcomment: [],
        haslikedreply: [],
        hasdislikedreply: [],
        haslikedtopic: [],
        hasdislikedtopic: [],
        following: [15, 16],
        followers: [18, 25, 27], // Liste der Follower des Benutzerspro
        notifications: [], // Benachrichtigungen für den Benutzer
        messages: [], // Privatnachrichten des Benutzers
        topicsaves: ["/0"],
        nestedReplies: [],
        filterSettings: {
          // Andere Einstellungen
          categories: [], // Ein leeres Array für ausgewählte Kategorien
        },
        joinedAt: "28.08.2023",
        email: "dejan.pantos@maschene.com",
        bio: "King of the street",
      },
      {
        id: 4,
        name: "Vegeta",
        profileImage: generateFakeProfileImage("Vegeta"),
        farbe: "4",
        tweets: [], // Liste der Tweets des Benutzers1
        createdReplies: [],
        procreated: [],
        contracreated: [],
        haslikedcomment: [],
        hasdislikedcomment: [],
        haslikedreply: [],
        hasdislikedreply: [],
        haslikedtopic: [],
        hasdislikedtopic: [],
        following: [15, 16],
        followers: [18, 25, 27], // Liste der Follower des Benutzerspro
        notifications: [], // Benachrichtigungen für den Benutzer
        messages: [], // Privatnachrichten des Benutzers
        topicsaves: ["/0"],
        nestedReplies: [],
        filterSettings: {
          // Andere Einstellungen
          categories: [], // Ein leeres Array für ausgewählte Kategorien
        },
        joinedAt: "28.08.2023",
        email: "dejan.pantos@maschene.com",
        bio: "King of the street",
      },
    ];

    return {
      topics: generateTopics(5, users, categories),
      users,
      currentUser: users[0],
      loggedin,
      selectedTab: "pro",
      selectedTabColor: "green",
      sessionId: null,
      displayedCommentCount: 3,
      comment: null, // Comment object
      reply: null, // Reply object
      commentReplyAnzeige: 5,
      categories,
    };
  },

  mutations: {
    updateCurrentUser(state, payload) {
      state.currentUser = { ...state.currentUser, ...payload };
    },
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
        totalVotes === 0 ? 0 : Math.round((topic.downvotes / totalVotes) * 100);
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
        user.haslikedreply = user.haslikedreply.filter((id) => id !== replyId);
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

    if (topic) {
      const user = state.users.find((user) => user.id === userId);
      if (user) {
        if (!user.haslikedtopic.includes(topicId)) {
          // Füge den Like hinzu
          topic.upvotes += 1;
          user.haslikedtopic.push(topicId);

          // Entferne den Dislike (falls vorhanden)
          if (user.hasdislikedtopic.includes(topicId)) {
            topic.downvotes -= 1;
            user.hasdislikedtopic = user.hasdislikedtopic.filter(
              (id) => id !== topicId
            );
          }
        } else {
          // Entferne den Like
          topic.upvotes -= 1;
          user.haslikedtopic = user.haslikedtopic.filter(
            (id) => id !== topicId
          );
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
  ADD_COMMENT_TO_TOPIC(state, { topicId, comment, selectedTab }) {
    const topic = state.topics.find((topic) => topic.id === topicId);
    if (topic) {
      if (comment.text.trim() !== "") {
        // Initialize the Vote properties for the new comment
        comment.upvotes = 0;
        comment.downvotes = 0;

        if (selectedTab === "contra") {
          comment.commentType = "contra"; // Richtiges Property verwenden
          topic.contraComments.push(comment);
          comment.author.contracreated.push(comment.id);
        } else {
          comment.commentType = "pro";
          topic.proComments.push(comment);
          comment.author.procreated.push(comment.id);
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
  },
  comment_und_reply2(state, { comment, reply }) {
    console.log("kolleg2")
    state.comment = comment;
    state.reply = reply;
  },

  actions: {
    commentundreply({ commit }, { comment, reply }) {

      commit("comment_und_reply2", { comment, reply });
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
    addCommentToTopic({ commit }, { topicId, comment, selectedTab }) {
      const updatedComment = { ...comment, id: uuidv4() }; // Zuweisung einer eindeutigen ID
      commit("ADD_COMMENT_TO_TOPIC", {
        topicId,
        comment: updatedComment,
        selectedTab,
      });
    },

    fetchComments({ state, commit }) {
      if (
        state.topics.every(
          (topic) =>
            topic.proComments.length > 0 || topic.contraComments.length > 0
        )
      ) {
        return;
      }

      for (const topic of state.topics) {
        if (topic.comments.length === 0) {
          const comments = generateComments(3, state.users);
          commit("ADD_COMMENTS_TO_TOPIC", { topicId: topic.id, comments });
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

    getTopicById: (state) => (id) => {
      return state.topics.find((topic) => topic.id === id);
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
