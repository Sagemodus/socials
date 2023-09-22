

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
        console.error(
          "Fehler beim Speichern der Topics in die Datenbank:",
          error
        );
        res
          .status(500)
          .send({
            message: "Fehler beim Speichern der Topics in die Datenbank",
          });
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
