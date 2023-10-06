const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors"); //Für password verschlüsselung

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

//Secure token random generate für reset token und Emailer
const crypto = require('crypto'); // For generating random tokens
const nodemailer = require('nodemailer'); // For sending emails


const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer);

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
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  })
);


//CHAT START

io.on('connection', (socket) => {
  console.log('User connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

  socket.on('chatMessage', (message) => {
    console.log(`Message: ${message}`);
    io.emit('chatMessage', message);
  });
});


//CHAT END



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

  console.log(newReply.path + " path");

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


app.post("/api/users/reset-password-request", async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email in the database
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Generate a random reset token
    const resetToken = crypto.randomBytes(20).toString("hex");

    // Set an expiration time for the reset token (e.g., 1 hour)
    const resetTokenExpiration = Date.now() + 3600000; // 1 hour in milliseconds

    // Update the user's record with the reset token and expiration time
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(resetTokenExpiration); // Store as a Date object
    await user.save();

    // Send an email to the user with the reset token and a link to the reset page
    const transporter = nodemailer.createTransport({
      // Configure your email provider here (e.g., SMTP)
    });

    const mailOptions = {
      from: "your@email.com",
      to: user.email,
      subject: "Password Reset",
      text: `You are receiving this email because you (or someone else) requested a password reset for your account.\n\n` +
        `Please click on the following link, or paste it into your browser to reset your password:\n\n` +
        `http://yourwebsite.com/reset-password/${resetToken}\n\n` +
        `If you did not request this, please ignore this email, and your password will remain unchanged.\n`,
    };

    transporter.sendMail(mailOptions, (error) => {
      if (error) {
        console.error("Error sending email:", error);
        res.status(500).send({ message: "Error sending email" });
      } else {
        console.log("Password reset email sent");
        res.status(200).send({ message: "Password reset email sent" });
      }
    });
  } catch (error) {
    console.error("Error initiating password reset:", error);
    res.status(500).send({ message: "Error initiating password reset" });
  }
});


// Define a route for resetting the password using the reset token
app.post("/api/users/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Find the user by the reset token and check if it's still valid
    const user = await User.findOne({
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: Date.now() }, // Check if the token is still valid
    });

    if (!user) {
      return res.status(400).send({ message: "Invalid or expired reset token" });
    }

    // Generate a new hashed password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update the user's password and reset token in the database
    user.hashedPassword = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).send({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).send({ message: "Error resetting password" });
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


app.get("/test", (req, res) => {
  res.send("Express.js-Server läuft!");
});

app.get("/", (req, res) => {
  res.send("Expresss.js-Server startseiteè!");
});

app.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});
