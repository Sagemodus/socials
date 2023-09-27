const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require('bcrypt'); //Für password verschlüsselung
const cors = require("cors"); 
const app = express();
const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");
const jwt = require('jsonwebtoken'); // Tokens für session authentifizierung

//von hier 
const { JSDOM } = require('jsdom');
const createDOMPurify = require('dompurify');
const { window } = new JSDOM('');
const DOMPurify = createDOMPurify(window);
// bis hier ist alles für sanitierung von inputs

const jwtSecretKey = 'BlaBlo123'; //MUSS UMBEDINGT VERÄNDERT WERDEN .ENV FILE SICHER STELLEN


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
    hashedPassword: String,
  })
);
/*

BIS JETZT NOCH DRAUSSEN, WIRD SPÄTER GEBRAUCHT BEI COMMENTS USW...

function verifyToken(req, res, next) {
  const token = req.headers.authorization; // Assuming the token is sent in the 'Authorization' header

  if (!token) {
    return res.status(401).json({ message: 'Token not provided' });
  }

  jwt.verify(token, jwtSecretKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    // If the token is valid, you can attach the user information to the request for use in the route handler
    req.user = decoded.user;
    next();
  });
}
*/

async function getNextUserId() {
  try {
    // Find the document with the highest id value
    const highestUser = await User.findOne({}, {}, { sort: { id: -1 } });

    // If there are no users in the database, start with ID 1; otherwise, increment the highest ID value
    const nextUserId = highestUser ? highestUser.id + 1 : 1;

    return nextUserId;
  } catch (error) {
    console.error("Error getting next user ID:", error);
    throw error;
  }
}

function generateAuthToken(user) {
  const payload = {
    user: {
      _id: user._id,
      username: user.username, // Add other user properties here
    },
  };

  const token = jwt.sign(payload, jwtSecretKey, {
    expiresIn: '1h',
  });

  return token;
}
app.post("/api/users/login", async (req, res) => {
  try {
    // Sanitize user inputs
    const name = DOMPurify.sanitize(req.body.name);
    const password = DOMPurify.sanitize(req.body.password);

    // Find the user by name in the database
    const user = await User.findOne({ name: name });

    if (!user) {
      return res.status(401).send({ message: "User not found" });
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);
    if (!isPasswordValid) {
      return res.status(401).send({ message: "Invalid password" });
    }

    // Generate a JWT token
    const token = generateAuthToken(user);

    // Send the token and user ID as a response
    console.log(user.id);
    res.status(200).send({ success: true, token, userId: user.id });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send({ message: "Error logging in" });
  }
});




app.post("/api/users/register", async (req, res) => {
  try {
    const userData = req.body;

    // Sanitize user input
    const sanitizedName = DOMPurify.sanitize(userData.name);
    const sanitizedPassword = DOMPurify.sanitize(userData.password);

    // Check if a user with the same name already exists
    const existingUser = await User.findOne({ name: sanitizedName });
    if (existingUser) {
      return res.status(400).send({ success: false, message: "User with this name already exists" });
    }

    // Get the next available user ID
    const nextUserId = await getNextUserId();

    // Set the id and joinedAt fields of the userData
    userData.id = nextUserId;
    userData.joinedAt = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    // Generate a salt and hash the user's password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(sanitizedPassword, saltRounds);

    // Replace the plain password with the hashed password
    userData.hashedPassword = hashedPassword;

    // Create a new user document with the sanitized data
    const user = new User({ name: sanitizedName, hashedPassword });
    await user.save();

    console.log("User successfully registered");
    res.status(200).send({ success: true, message: "User successfully registered" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send({ success: false, message: "Error registering user" });
  }
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
  res.send("Expresss.js-Server startseiteè!");
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
