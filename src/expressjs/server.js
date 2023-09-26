const express = require("express");
const mongoose = require("mongoose");
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
    text: String,
    author: Object,
    category: Object,
    contraComments: [
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
            commentIndex: Number,
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
            commentIndex: Number,
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

// Definieren Sie die API-Route zum Hinzufügen von Topics
app.post("/api/addTopics", async (req, res) => {
  try {
    const topicsData = req.body; // Die Topics-Daten kommen im Anforderungskörper als Array von Objekten
    // Hier können Sie die gesendeten Daten anzeigen

    // Iterieren Sie durch jedes Element in den Topics-Daten

    // Erstellen Sie ein neues Topic-Dokument und speichern Sie es in der Datenbank
    const topic = new Topic(topicsData);
    await topic.save();

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

    console.log(users + " bruder");
    res.json(users); // Senden Sie die Daten als JSON an den Client
  } catch (error) {
    console.error("Fehler beim Abrufen der Daten aus der Datenbank:", error);
    res
      .status(500)
      .json({ message: "Fehler beim Abrufen der Daten aus der Datenbank" });
  }
});

app.post("/api/addComment", async (req, res) => {
  const { comment } = req.body;
  console.log(comment + " kure");
  try {
    // Suchen Sie das Thema in der Datenbank anhand seiner ID
    const topic = await Topic.findOne({ id: comment.topicId});

    if (!topic) {
      return res.status(404).json({ error: "Thema nicht gefunden" });
    }

    // Fügen Sie den neuen Kommentar zum Thema hinzu
    topic.comments.push(comment);

    // Speichern Sie das aktualisierte Thema in der Datenbank
    await topic.save();

    // Senden Sie eine Erfolgsantwort zurück
    res.status(200).json({ message: "Kommentar erfolgreich hinzugefügt" });
  } catch (error) {
    console.error("Fehler beim Hinzufügen des Kommentars:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

app.get("/test", (req, res) => {
  res.send("Express.js-Server läuft!");
});

app.get("/", (req, res) => {
  res.send("Willkommen auf der Startseidtpppe!");
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
