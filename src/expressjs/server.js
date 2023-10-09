const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors"); // Importieren Sie das cors-Modul
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");

app.use(cors());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// MongoDB-Verbindung herstellen
mongoose.connect("mongodb://127.0.0.1:27017/procon");
const db = mongoose.connection;

db.once("open", () => {
  console.log("Verbindung zur MongoDB hergestellt");
});

db.on("error", (err) => {
  console.error("Fehler bei der Verbindung zur MongoDB:", err);
});

const Topic = mongoose.model(
  "Topic",
  new mongoose.Schema({
    title: String,
    text: String,
    author: Object,
    category: Object,
    contraComments: [
      {
        author: Object,
        commentType: String,
        createdAt: Date,
        downvotes: Number,
        expandReplies: Boolean,
        id: String,
        path: String,
        replies: [
          {
            Commentpath: String,
            author: Object,
            authorPath: Number,
            commentobjekt: Object,
            createdAt: Date,
            downvotes: Number,
            expandReplies: Boolean,
            id: String,
            path: String,
            replies: Array,
            replytype: String,
            text: String,
            topicId: String,
            upvotes: Number,
          },
        ],
        showelement: Boolean,
        text: String,
        topicId: String,
        upvotes: Number,
      },
    ],
    createdAt: Date,
    downvotePercentage: String,
    downvotes: Number,
    id: String,
    path: String,
    proComments: [
      {
        author: Object,
        commentIndex: Number,
        commentType: String,
        createdAt: Date,
        downvotes: Number,
        expandReplies: Boolean,
        id: String,
        path: String,
        replies: [
          {
            Commentpath: String,
            author: Object,
            authorPath: Number,
            commentobjekt: Object,
            createdAt: Date,
            downvotes: Number,
            expandReplies: Boolean,
            id: String,
            path: String,
            replies: Array,
            replytype: String,
            text: String,
            topicId: String,
            upvotes: Number,
          },
        ],
        showelement: Boolean,
        text: String,
        topicId: String,
        upvotes: Number,
      },
    ],
    upvotePercentage: String,
    upvotes: Number,
    // andere Felder...
  })
);

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: String,
    bio: String,
    contracreated: Array,
    createdReplies: Array,
    email: String,
    farbe: String,
    filterSettings: Object,
    followers: Array,
    following: Array,
    hasdislikedcomment: Array,
    hasdislikedreply: Array,
    hasdislikedtopic: Array,
    haslikedcomment: Array,
    haslikedreply: Array,
    haslikedtopic: Array,
    id: Number,
    joinedAt: String,
    messages: Array,
    nestedReplies: Array,
    notifications: Array,
    procreated: Array,
    profileImage: String,
    topicsaves: Array,
    tweets: Array,
  })
);
function searchReplyInCommentAndReplies(comment, replyId) {
  // Überprüfen Sie zuerst den aktuellen Kommentar
  console.log(comment.id);
  if (comment.id === replyId) {
    return comment;
  }

  // Durchsuchen Sie dann die Antworten des aktuellen Kommentars
  for (let reply of comment.replies) {
    if (reply.id === replyId) {
      return reply;
    }

    // Wenn die Antwort Unterantworten hat, suchen Sie rekursiv darin
    const foundReply = searchReplyInCommentAndReplies(reply, replyId);
    if (foundReply) {
      return foundReply;
    }
  }

  // Wenn die Antwort nicht gefunden wurde, geben Sie null zurück
  return null;
}

app.post("/api/replydownvote", async (req, res) => {
  try {
    const { replyId, currentUserId, topicId, commentId } = req.body;

    const topic = await Topic.findOne({ id: topicId });
    const user = await User.findOne({ id: currentUserId });

    if (!topic || !user) {
      res.status(404).send({ message: "Thema oder Benutzer nicht gefunden" });
      return;
    }

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

    if (!reply) {
      res.status(404).send({ message: "Antwort nicht gefunden" });
      return;
    }

    const hasLiked = user.haslikedreply.includes(replyId);
    const hasDisliked = user.hasdislikedreply.includes(replyId);

    if (hasDisliked) {
      reply.downvotes -= 1;
      user.hasdislikedreply = user.hasdislikedreply.filter(
        (id) => id !== replyId
      );
    } else {
      if (hasLiked) {
        reply.upvotes -= 1;
        user.haslikedreply = user.haslikedreply.filter((id) => id !== replyId);
      }
      reply.downvotes += 1;
      user.hasdislikedreply.push(replyId);
    }

    await topic.save();
    await user.save();

    console.log("Antwort erfolgreich in der Datenbank heruntergewertet");
    res.status(200).send({
      success: true,
      message: "Antwort erfolgreich in der Datenbank heruntergewertet",
    });
  } catch (error) {
    console.error(
      "Fehler beim Herunterwerten der Antwort in der Datenbank:",
      error
    );
    res.status(500).send({
      message: "Fehler beim Herunterwerten der Antwort in der Datenbank",
    });
  }
});

app.post("/api/replyupvote", async (req, res) => {
  try {
    const { replyId, currentUserId, topicId, commentId } = req.body;

    const topic = await Topic.findOne({ id: topicId });
    const user = await User.findOne({ id: currentUserId });

    if (!topic || !user) {
      res.status(404).send({ message: "Thema oder Benutzer nicht gefunden" });
      return;
    }

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

    if (!reply) {
      res.status(404).send({ message: "Antwort nicht gefunden" });
      return;
    }

    const hasLiked = user.haslikedreply.includes(replyId);
    const hasDisliked = user.hasdislikedreply.includes(replyId);

    if (hasLiked) {
      reply.upvotes -= 1;
      user.haslikedreply = user.haslikedreply.filter((id) => id !== replyId);
    } else {
      if (hasDisliked) {
        reply.downvotes -= 1;
        user.hasdislikedreply = user.hasdislikedreply.filter(
          (id) => id !== replyId
        );
      }
      reply.upvotes += 1;
      user.haslikedreply.push(replyId);
    }

    await topic.save();
    await user.save();

    console.log("Antwort erfolgreich in der Datenbank hochgewertet");
    res.status(200).send({
      success: true,
      message: "Antwort erfolgreich in der Datenbank hochgewertet",
    });
  } catch (error) {
    console.error(
      "Fehler beim Hochwerten der Antwort in der Datenbank:",
      error
    );
    res.status(500).send({
      message: "Fehler beim Hochwerten der Antwort in der Datenbank",
    });
  }
});

app.post("/api/commentdownvote", async (req, res) => {
  try {
    const { commentId, currentUserId, topicId } = req.body;

    const topic = await Topic.findOne({ id: topicId });
    const user = await User.findOne({ id: currentUserId });

    if (!topic || !user) {
      res.status(404).send({ message: "Thema oder Benutzer nicht gefunden" });
      return;
    }

    const comment =
      topic.proComments.find((comment) => comment.id === commentId) ||
      topic.contraComments.find((comment) => comment.id === commentId);

    if (!comment) {
      res.status(404).send({ message: "Kommentar nicht gefunden" });
      return;
    }

    const hasLiked = user.haslikedcomment.includes(commentId);
    const hasDisliked = user.hasdislikedcomment.includes(commentId);

    if (hasDisliked) {
      comment.downvotes -= 1;
      user.hasdislikedcomment = user.hasdislikedcomment.filter(
        (id) => id !== commentId
      );
    } else {
      if (hasLiked) {
        comment.upvotes -= 1;
        user.haslikedcomment = user.haslikedcomment.filter(
          (id) => id !== commentId
        );
      }
      comment.downvotes += 1;
      user.hasdislikedcomment.push(commentId);
    }

    await topic.save();
    await user.save();

    console.log("Kommentar erfolgreich in der Datenbank herabgewertet");
    res.status(200).send({
      success: true,
      message: "Kommentar erfolgreich in der Datenbank herabgewertet",
    });
  } catch (error) {
    console.error(
      "Fehler beim Herabwerten des Kommentars in der Datenbank:",
      error
    );
    res.status(500).send({
      message: "Fehler beim Herabwerten des Kommentars in der Datenbank",
    });
  }
});

app.post("/api/commentupvote", async (req, res) => {
  try {
    const payload = req.body;
    const { commentId, currentUserId, topicId } = payload;

    const topic = await Topic.findOne({ id: topicId });
    const user = await User.findOne({ id: currentUserId });

    if (!topic || !user) {
      res.status(404).send({ message: "Thema oder Benutzer nicht gefunden" });
      return;
    }

    const comment =
      topic.proComments.find((comment) => comment.id === commentId) ||
      topic.contraComments.find((comment) => comment.id === commentId);

    if (!comment) {
      res.status(404).send({ message: "Kommentar nicht gefunden" });
      return;
    }

    const hasLiked = user.haslikedcomment.includes(commentId);
    const hasDisliked = user.hasdislikedcomment.includes(commentId);

    if (hasLiked) {
      comment.upvotes -= 1;
      user.haslikedcomment = user.haslikedcomment.filter(
        (id) => id !== commentId
      );
    } else {
      if (hasDisliked) {
        comment.downvotes -= 1;
        user.hasdislikedcomment = user.hasdislikedcomment.filter(
          (id) => id !== commentId
        );
      }
      comment.upvotes += 1;
      user.haslikedcomment.push(commentId);
    }

    await topic.save();
    await user.save();

    console.log("Kommentar erfolgreich in der Datenbank hochgewertet");
    res.status(200).send({
      success: true,
      message: "Kommentar erfolgreich in der Datenbank hochgewertet",
    });
  } catch (error) {
    console.error(
      "Fehler beim Hochwerten des Kommentars in der Datenbank:",
      error
    );
    res.status(500).send({
      message: "Fehler beim Hochwerten des Kommentars in der Datenbank",
    });
  }
});

app.post("/api/topicdislike", async (req, res) => {
  try {
    const payload = req.body;
    const topicId = payload.topicId;
    const userId = payload.userId;

    const topic = await Topic.findOne({ id: topicId });
    const user = await User.findOne({ id: userId });

    if (!topic || !user) {
      res.status(404).send({ message: "Thema oder Benutzer nicht gefunden" });
      return;
    }

    const hasLiked = user.haslikedtopic.includes(topicId);
    const hasDisliked = user.hasdislikedtopic.includes(topicId);

    if (!hasDisliked) {
      topic.downvotes += 1;
      user.hasdislikedtopic.push(topicId);
      if (hasLiked) {
        topic.upvotes -= 1;
        user.haslikedtopic = user.haslikedtopic.filter((id) => id !== topicId);
      }
    } else {
      topic.downvotes -= 1;
      user.hasdislikedtopic = user.hasdislikedtopic.filter(
        (id) => id !== topicId
      );
    }

    await topic.save();
    await user.save();

    console.log("Dislike erfolgreich in die Datenbank gespeichert");
    res.status(200).send({
      success: true,
      message: "Dislike erfolgreich in die Datenbank gespeichert",
    });
  } catch (error) {
    console.error(
      "Fehler beim Speichern des Dislikes in die Datenbank:",
      error
    );
    res.status(500).send({
      message: "Fehler beim Speichern des Dislikes in die Datenbank",
    });
  }
});

app.patch("/api/topiclike", async (req, res) => {
  try {
    const payload = req.body;
    const topicId = payload.topicId;
    const userId = payload.userId;

    // Finde das Thema und den Benutzer in der Datenbank
    const topic = await Topic.findOne({ id: topicId });
    const user = await User.findOne({ id: userId });

    // Überprüfe, ob das Thema und der Benutzer existieren
    if (!topic || !user) {
      res.status(404).send({ message: "Thema oder Benutzer nicht gefunden" });
      return;
    }

    // Überprüfe, ob der Benutzer das Thema bereits geliked oder disliked hat
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

    // Hier können Sie die updatePercentages(topic)-Funktion implementieren, wenn Sie sie im Backend haben

    // Speichern Sie die Änderungen in der Datenbank
    await topic.save();
    await user.save();

    console.log("Topics erfolgreich in die Datenbank gespeichert");
    res.status(200).send({
      success: true,
      message: "Topics erfolgreich in die Datenbank gespeichert",
    });
  } catch (error) {
    console.error("Fehler beim Speichern der Topics in die Datenbank:", error);
    res.status(500).send({
      message: "Fehler beim Speichern der Topics in die Datenbank",
    });
  }
});

app.post("/api/addFilterUser", async (req, res) => {
  const filterSettings = req.body.filterSettings;
  const currentUserId = req.body.currentUserId;

  console.log(currentUserId);
  console.log;
  if (!filterSettings || !currentUserId) {
    return res.status(400).json({
      success: false,
      message: "Filtereinstellungen oder Benutzer-ID fehlen.",
    });
  }

  try {
    const user = await User.findOne({ id: currentUserId });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Benutzer nicht gefunden." });
    }

    // Aktualisieren Sie das User-Objekt mit den neuen Filtereinstellungen
    user.filterSettings = filterSettings;

    // Speichern Sie den aktualisierten Benutzer in der Datenbank
    await user.save();

    res.json({
      success: true,
      message: "Benutzer erfolgreich aktualisiert.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Ein Fehler ist aufgetreten.",
      error: error.message,
    });
  }
});

app.put("/api/users/:userId/addReplyPath", async (req, res) => {
  const userId = req.params.userId;
  const replyPath = req.body.replyPath;

  try {
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).json({ error: "Benutzer nicht gefunden" });
    }

    // Fügen Sie den Reply-Pfad zum nestedReplies Array hinzu
    user.nestedReplies.push(replyPath);

    await user.save();

    res.json({ success: true, message: "Reply-Pfad erfolgreich hinzugefügt" });
  } catch (error) {
    console.error("Fehler beim Hinzufügen des Reply-Pfads:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

app.post("/api/replies", async (req, res) => {
  const newReply = req.body;

  console.log(newReply.topicId + " path");

  try {
    const topic = await Topic.findOne({ id: newReply.topicId });

    if (!topic) {
      return res.status(404).json({ error: "Thema nicht gefunden" });
    }

    const parts = newReply.path.split("/").filter((p) => p);
    let currentArray;

    if (parts[1].startsWith("pro")) {
      currentArray =
        topic.proComments[parseInt(parts[1].split("_")[1])].replies;
    } else {
      currentArray =
        topic.contraComments[parseInt(parts[1].split("_")[1])].replies;
    }

    if (!currentArray) {
      return res.status(400).json({ error: "Ungültiger Pfad (pro/contra)" });
    }

    for (let i = 2; i < parts.length - 1; i++) {
      const index = parseInt(parts[i], 10);
      if (!currentArray[index]) {
        return res.status(400).json({ error: `Ungültiger Pfadindex bei ${i}` });
      }
      currentArray = currentArray[index].replies;
    }
    console.log(currentArray);
    currentArray.push(newReply);

    topic.markModified("proComments");
    topic.markModified("contraComments");
    await topic.save();

    res.json({ success: true });
  } catch (error) {
    console.error("Fehler beim Hinzufügen der Antwort:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

const validateReply = (reply) => {
  if (!reply.topicId || !reply.commentId || !reply.commentType) {
    throw new Error("Ungültige Anfrage");
  }

  if (reply.commentType !== "pro" && reply.commentType !== "contra") {
    throw new Error("Ungültiger Kommentartyp");
  }
};

app.post("/api/addReply", async (req, res) => {
  const reply = req.body;

  console.log(reply.commentType);
  console.log(reply.commentId);
  console.log(reply.topicId);
  try {
    validateReply(reply);

    const topic = await Topic.findOne({ id: reply.topicId });

    if (!topic) {
      return res.status(404).json({ error: "Thema nicht gefunden" });
    }

    const commentArray =
      reply.commentType === "pro" ? topic.proComments : topic.contraComments;
    const parentComment = commentArray.find((c) => c.id === reply.commentId);

    if (!parentComment) {
      return res.status(404).json({ error: "Kommentar nicht gefunden" });
    }

    parentComment.replies.push(reply);
    await topic.save();

    res
      .status(200)
      .json({ success: true, message: "Reply erfolgreich hinzugefügt" });
  } catch (error) {
    console.error("Fehler beim Hinzufügen des Reply:", error);
    const errorMessage = error.message || "Interner Serverfehler";
    const statusCode = error.statusCode || 500;
    res.status(statusCode).json({ error: errorMessage });
  }
});

app.post("/api/addUserReply", async (req, res) => {
  const comment = req.body.comment;
  const reply = req.body.reply;
  const authorId = reply.author;
  console.log(comment + " kolleg");
  console.log(reply + " author");
  try {
    const user = await User.findOne({ id: authorId });
    if (!user) {
      return res.status(404).json({ error: "Benutzer nicht gefunden" });
    }
    console.log(reply.path + " path");
    user.nestedReplies.push(reply.path);

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Kommentar erfolgreich hinzugefügt" });
  } catch (error) {
    // Speichern Sie das aktualisierte Thema in der Datenbank
    console.error("Fehler beim Hinzufügen des Kommentars:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }

  // Senden Sie eine Erfolgsantwort zurück
});

app.post("/api/addUsers", async (req, res) => {
  try {
    const userData = req.body; // Die Topics-Daten kommen im Anforderungskörper als Array von Objekten
    // Hier können Sie die gesendeten Daten anzeigen

    // Iterieren Sie durch jedes Element in den Topics-Daten

    // Erstellen Sie ein neues Topic-Dokument und speichern Sie es in der Datenbank
    const user = new User(userData);
    await user.save();

    console.log("Topics erfolgreich in die Datenbank gespeichert");
    res
      .status(200)
      .send({ message: "Topics erfolgreich in die Datenbank gespeichert" });
  } catch (error) {
    console.error("Fehler beim Speichern der Topics in die Datenbank:", error);
    res.status(500).send({
      message: "Fehler beim Speichern der Topics in die Datenbank",
    });
  }
});

app.get("/api/topics/:topicId", async (req, res) => {
  const topicId = req.params.topicId;

  try {
    // Suchen Sie das Thema in der Datenbank anhand seiner ID
    const topic = await Topic.findOne({ id: topicId });

    if (!topic) {
      return res.status(404).json({ error: "Thema nicht gefunden" });
    }
    console.log("funktioniert homie");
    res.json(topic);
  } catch (error) {
    console.error("Fehler beim Abrufen des Themas:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

app.post("/api/users/register", async (req, res) => {
  try {
    const userData = req.body;

    // Generate a salt and hash the user's password
    const saltRounds = 10; // Number of salt rounds
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Replace the plain password with the hashed password
    userData.password = hashedPassword;

    // Create a new user document with the hashed password
    const user = new User(userData);
    await user.save();

    console.log("User successfully registered");
    res.status(200).send({ message: "User successfully registered" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send({ message: "Error registering user" });
  }
});

// Definieren Sie die API-Route zum Hinzufügen von Topics
app.post("/api/addTopics", async (req, res) => {
  try {
    const topicsData = req.body; // Die Topics-Daten kommen im Anforderungskörper als Array von Objekten

    // Hier können Sie die gesendeten Daten anzeigen

    // Iterieren Sie durch jedes Element in den Topics-Daten

    // Aktualisieren Sie das Topic-Dokument, wenn es existiert, oder erstellen Sie ein neues, wenn es nicht existiert
    await Topic.findOneAndUpdate(
      { _id: topicsData._id }, // Suchkriterium, z.B. basierend auf der ID
      topicsData, // Die Daten, die aktualisiert werden sollen
      { upsert: true, new: true } // Optionen: upsert erstellt ein neues Dokument, wenn es nicht existiert; new gibt das aktualisierte Dokument zurück
    );

    console.log(
      "Topics erfolgreich in die Datenbank gespeichert oder aktualisiert"
    );
    res.status(200).send({
      message:
        "Topics erfolgreich in die Datenbank gespeichert oder aktualisiert",
    });
  } catch (error) {
    console.error(
      "Fehler beim Speichern oder Aktualisieren der Topics in die Datenbank:",
      error
    );
    res.status(500).send({
      message:
        "Fehler beim Speichern oder Aktualisieren der Topics in die Datenbank",
    });
  }
});

app.get("/api/topics", async (req, res) => {
  try {
    const topics = await Topic.find(); // Annahme: Sie haben ein Model namens "Topic" definiert

    res.json(topics); // Senden Sie die Daten als JSON an den Client
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten aus der Datenbank:", error);
    res
      .status(500)
      .json({ message: "Fehler beim Abrufen der Daten aus der Datenbank" });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find(); // Annahme: Sie haben ein Model namens "Topic" definiert

    res.json(users); // Senden Sie die Daten als JSON an den Client
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten aus der Datenbank:", error);
    res
      .status(500)
      .json({ message: "Fehler beim Abrufen der Daten aus der Datenbank" });
  }
});

app.post("/api/addComment", async (req, res) => {
  const comment = req.body;

  try {
    console.log(comment.topicId);

    const topic = await Topic.findOne({ id: comment.topicId });
    if (!topic) {
      return res.status(404).json({ error: "Thema nicht gefunden" });
    }

    // Fügen Sie den neuen Kommentar zum Thema hinzu
    if (comment.commentType == "pro") {
      topic.proComments.push(comment);
    }

    if (comment.commentType == "contra") {
      topic.contraComments.push(comment);
    }

    // Speichern Sie das aktualisierte Thema in der Datenbank
    await topic.save();

    // Senden Sie eine Erfolgsantwort zurück
    res.status(200).json({ message: "Kommentar erfolgreich hinzugefügt" });
  } catch (error) {
    console.error("Fehler beim Hinzufügen des Kommentars:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});

app.post("/api/addTopicToSaves", async (req, res) => {
  const path = req.body.path;
  const currentUserId = req.body.currentUserId;
  console.log(currentUserId);
  console.log(path);
  try {
    const user = await User.findOne({ id: currentUserId });
    if (!user) {
      return res.status(404).json({ error: "Benutzer nicht gefunden" });
    }
    console.log(path + " path");
    user.topicsaves.push(path);

    await user.save();
    res
      .status(200)
      .json({ success: true, message: "Topic erfolgreich hinzugefügt" });
  } catch (error) {
    // Speichern Sie das aktualisierte Thema in der Datenbank
    console.error("Fehler beim Hinzufügen des Topics:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }

  // Senden Sie eine Erfolgsantwort zurück
});
