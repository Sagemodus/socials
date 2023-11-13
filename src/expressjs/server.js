const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors"); // Importieren Sie das cors-Modul
require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const admin = require("firebase-admin");
const serviceAccount = require("./procon-14ef5-firebase-adminsdk-nmd71-7131b1ec7a.json");
const http = require("http"); // Neu hinzugefügt
const Chat = require("./models/Chat");
const Topic = require("./models/Topic");
const User = require("./models/User");
const cron = require("node-cron");


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const app = express();
const server = http.createServer(app); // Ersetzen Sie 'app' durch 'server'
const io = require("socket.io")(server, {
  cors: {
    origin: "*",

    cdmethods: ["GET", "POST"],
  },
});

const port = process.env.PORT || 3000;
const bodyParser = require("body-parser");

const jwt = require("jsonwebtoken"); // Tokens für session authentifizierung

//von hier
const { JSDOM } = require("jsdom");
const createDOMPurify = require("dompurify");
const { window } = new JSDOM("");
const DOMPurify = createDOMPurify(window);
// bis hier ist alles für sanitierung von inputs

//Secure token random generate für reset token und Emailer
const crypto = require("crypto"); // For generating random tokens
const nodemailer = require("nodemailer"); // For sending emails
const { FALSE, TRUE } = require("node-sass");


const jwtSecretKey = process.env.JWT_SECRET;

app.use(
  cors({
    origin: ["https://c964nzv2-8080.euw.devtunnels.ms", "*"], // Replace with actual domains
    credentials: true, // If your frontend needs to send cookies or use authentication, set this to true
  })
);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// MongoDB-Verbindung herstellen
mongoose.connect(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;

db.once("open", () => {
  console.log("Verbindung zur MongoDB hergestellt");
});

db.on("error", (err) => {
  console.error("Fehler bei der Verbindung zur MongoDB:", err);
});

const clean = async () => {
  const thirtyDaysAgo = new Date(new Date().setDate(new Date().getDate() - 30));

  try {
    // Benutzer finden, die gelesene Benachrichtigungen älter als 30 Tage haben
    const usersWithNotifications = await User.find({
      "notifications.read": true,
      "notifications.sentAt": { $lte: thirtyDaysAgo },
    });

    // Benutzer aktualisieren, deren Benachrichtigungen älter als 30 Tage sind
    await Promise.all(
      usersWithNotifications.map(async (user) => {
        user.notifications = user.notifications.filter(
          (notification) =>
            !notification.read || notification.sentAt > thirtyDaysAgo
        );
        return user.save(); // Das save() mit return zurückgeben, damit Promise.all darauf warten kann
      })
    );

    // Benutzer finden, die als gelöscht markiert wurden und deren deletedAt mehr als 30 Tage zurückliegt
    const deletedUsers = await User.find({
      isDeleted: true,
      deletedAt: { $lte: thirtyDaysAgo },
    });

    // Benutzer löschen, die als gelöscht markiert wurden und deren deletedAt mehr als 30 Tage zurückliegt
    const deleteOperations = deletedUsers.map((user) =>
      User.deleteOne({ _id: user._id })
    );
    await Promise.all(deleteOperations);

    console.log(
      "Old notifications cleaned up and accounts deleted if older than 30 days."
    );
  } catch (error) {
    console.error("Error during cleanup:", error);
  }
};

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
      text:
        `You are receiving this email because you (or someone else) requested a password reset for your account.\n\n` +
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
      return res
        .status(400)
        .send({ message: "Invalid or expired reset token" });
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

app.post("/api/removeChat", async (req, res) => {
  const { chatId, currentUserId } = req.body;
  try {
    // Find entity based on payloadVariable2
    const entity = await User.findOne({ id: currentUserId });

    // Check if the entity was found
    if (!entity) {
      return res.status(404).send({
        success: false,
        message: "Entity nicht gefunden",
      });
    }
    console.log("chatId: ", chatId);
    console.log("vorher", entity.activeChats);
    // Process the entity's data
    entity.activeChats = entity.activeChats.filter((chat) => chat !== chatId);

    console.log("nacher", entity.activeChats);
    // Mark the data array as modified
    entity.markModified("Activechats");

    // Save the updated entity back to the database
    await entity.save();

    res.status(200).send({
      success: true,
      message: "Daten erfolgreich in die Datenbank gespeichert",
    });
  } catch (error) {
    console.error(
      "Fehler beim Aktualisieren der Daten in der Datenbank:",
      error
    );
    res.status(500).send({
      message: "Fehler beim Aktualisieren der Daten in der Datenbank",
    });
  }
});

app.get("/chats/:chatId", async (req, res) => {
  const { chatId } = req.params;
  const chat = await Chat.findOne({ chatId: chatId });

  if (chat) {
    res.json(chat);
  } else {
    res.status(404).json({ message: "Chat nicht gefunden" });
  }
});

app.post("/api/acceptRequest", async (req, res) => {
  try {
    const { chatId } = req.body;
    console.log(chatId);
    // Benutzerdetails abrufen

    // Chats des Benutzers abrufen
    const chat = await Chat.findOne({ chatId: chatId });
    console.log(chat);
    if (!chat) {
      res.status(500).send({
        message: "Fehler der Caht wurde nicht gefunden",
        success: false,
      });
    }

    chat.isPending = false;
    console.log(chat);
    await chat.save();
    res.status(200).send({
      success: true,
      message: "Chat erfolgreich aktualisiert",
    });
  } catch (error) {
    console.error("Fehler: ", error);
    res.status(500).send({
      message: "Fehler fetchen der Chats",
      success: false,
    });
  }
});

app.post("/api/chats", async (req, res) => {
  try {
    const { currentUserChats } = req.body;

    // Benutzerdetails abrufen

    // Chats des Benutzers abrufen
    const chats = await Chat.find({
      chatId: { $in: currentUserChats },
      isRejected: false,
    });

    if (!chats) {
      res.status(500).send({
        message: "Fehler der Caht wurde nicht gefunden",
      });
    }
    res.status(200).send({
      success: true,
      message: "Chats erfolgreich gefetcht",
      chats: chats,
    });
  } catch (error) {
    console.error("Fehler: ", error);
    res.status(500).send({
      message: "Fehler fetchen der Chats",
    });
  }
});
const userSockets = {}; // Objekt zur Speicherung der Zuordnung zwischen Benutzer-IDs und socket.id
const onlineUsers = [];

io.on("connection", (socket) => {
  console.log("Ein Benutzer ist verbunden:", socket.id);

  socket.on("register", (userId) => {
    if (!userSockets[userId]) {
      userSockets[userId] = [];
    }
    if (!userSockets[userId].includes(socket.id)) {
      userSockets[userId].push(socket.id);
    }
    if (!onlineUsers.includes(userId)) {
      onlineUsers.push(userId);
    }
  });

  socket.on("send-message", async (message) => {
    try {
      console.log("message angfang : ", message);
      // Finden Sie den Chat anhand der chatId
      const chat = await Chat.findOne({ chatId: message.chatId });

      console.log(message.chatId);
      if (chat) {
        // Fügen Sie die neue Nachricht zu den Nachrichten des Chats hinzu
        chat.messages.push({
          text: message.text,
          senderId: message.senderId,
          timestamp: new Date(),
          chatId: message.chatId,
        });

        // Speichern Sie die Änderungen
        await chat.save();
        console.log("Nachricht zu einem bestehenden Chat hinzugefügt");
        console.log(chat.participants, "Teilnehmer");

        // Bestimmen Sie den Empfänger der Nachricht
        let recipientId = chat.participants.find(
          (id) => id !== message.senderId
        );
        console.log("mrk", recipientId);
        if (!recipientId) {
          console.log("Nachricht an sich selbst gesendet.");
          recipientId = chat.participants[0];
        }

        console.log(recipientId, " :id");
        console.log(userSockets, " usersockets");
        // Senden Sie die Nachricht nur an den gewünschten Benutzer
        const recipientSocketId = userSockets[recipientId];
        console.log("versueche", recipientSocketId);

        const callbackUser = userSockets[message.senderId];

        console.log(callbackUser, " callback");
        if (recipientSocketId) {
          console.log("Socketid", recipientSocketId, userSockets);
          io.to(recipientSocketId).emit("message", message);
        } 
      } else {
        console.log("Chat nicht gefunden");
      }
    } catch (error) {
      console.error(
        "Fehler beim Hinzufügen der Nachricht zu einem bestehenden Chat:",
        error
      );
    }
  });

  socket.on("disconnect", () => {
    console.log(userSockets);
    console.log("Ein Benutzer wurde getrennt:", socket.id);
    for (let userId in userSockets) {
      const index = userSockets[userId].indexOf(socket.id);
      if (index !== -1) {
        userSockets[userId].splice(index, 1);
        if (userSockets[userId].length === 0) {
          delete userSockets[userId];
          console.log(userSockets);
          const onlineIndex = onlineUsers.indexOf(userId);
          if (onlineIndex !== -1) {
            onlineUsers.splice(onlineIndex, 1);
          }
        }
        break;
      }
    }
  });
});
app.get("/api/online-status", (req, res) => {
  res.json(onlineUsers);
});
server.listen(port, () => {
  console.log(`Server läuft auf Port ${port}`);
});

app.post("/api/createchat", async (req, res) => {
  const { currentUserId, propuserId } = req.body;
  console.log("kolleg: ", req.body);
    console.log(" propuserId: ", propuserId);
  console.log(" currentUserId: ", currentUserId);
  try {
    // Find entity based on payloadVariable2
    const user1 = await User.findOne({ id: currentUserId });
    const user2 = await User.findOne({ id: propuserId });

    // Check if the entity was found
    if (!user1 || !user2) {
      return res.status(404).send({
        success: false,
        message: "user nicht gefunden",
      });
    }
    console.log(currentUserId, propuserId);
    // Check if a chat already exists between these two users
const existingChat = await Chat.findOne({
  participants: { $all: [currentUserId, propuserId] },
});

if (existingChat && existingChat.isPending) {
  console.log(existingChat);
  return res.status(400).send({
    success: false,
    message: "Ein Chat zwischen diesen Benutzern existiert bereits.",
    chat: existingChat,
  });
}


    const chat = {
      participants: [currentUserId, propuserId],
      messages: [],
      isPending: true,
      isRejected: false,
      startedBy: currentUserId,
    };
    // Process the entity's data
    chat.chatId = uuidv4();
    const newChat = new Chat(chat);

    // Mark the data array as modified
    user1.activeChats.push(chat.chatId);
    user2.activeChats.push(chat.chatId);
    // Save the updated entity back to the database
    await user1.save();
    await user2.save();
    await newChat.save();
    res.status(200).send({
      success: true,

      message: "Daten erfolgreich in die Datenbank gespeichert",
      chat: newChat,
    });
  } catch (error) {
    console.error(
      "Fehler beim Aktualisieren der Daten in der Datenbank:",
      error
    );
    res.status(500).send({
      message: "Fehler beim Aktualisieren der Daten in der Datenbank",
    });
  }
});

app.post("/api/updateAllRead", async (req, res) => {
  const { readArray, currentUserId } = req.body;
  try {
    // Benutzer basierend auf currentUserId finden
    const user = await User.findOne({ id: currentUserId });

    // Überprüfen, ob der Benutzer gefunden wurde
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Benutzer nicht gefunden",
      });
    }

    // Durchlaufen Sie das user.notifications Array
    user.notifications.forEach((notification) => {
      // Wenn die messageId der Benachrichtigung im readArray enthalten ist, setzen Sie read auf true
      if (readArray.includes(notification.messageId)) {
        notification.read = true;
      }
    });

    // Markieren Sie das notifications Array als geändert
    user.markModified("notifications");

    // Speichern Sie den aktualisierten Benutzer zurück in die Datenbank
    await user.save();

    res.status(200).send({
      success: true,
      message: "Read erfolgreich in die Datenbank gespeichert",
    });
  } catch (error) {
    console.error(
      "Fehler beim Aktualisieren des Read-Status in der Datenbank:",
      error
    );
    res.status(500).send({
      message: "Fehler beim Aktualisieren des Read-Status in der Datenbank",
    });
  }
});
app.post("/api/updatereadChat", async (req, res) => {
  const currentchat = req.body;
  try {
    // Find entity based on payloadVariable2
    const chat = await Chat.findOne({ chatId: currentchat.chatId });

    // Check if the entity was found
    if (!chat) {
      return res.status(404).send({
        success: false,
        message: "Entity nicht gefunden",
      });
    }

    // Process the entity's data
    chat.read = true;

    // Mark the data array as modified

    // Save the updated entity back to the database
    await chat.save();
    console.log(chat.read);
    res.status(200).send({
      success: true,
      message: "Daten erfolgreich in die Datenbank gespeichert",
    });
  } catch (error) {
    console.error(
      "Fehler beim Aktualisieren der Daten in der Datenbank:",
      error
    );
    res.status(500).send({
      message: "Fehler beim Aktualisieren der Daten in der Datenbank",
    });
  }
});

app.post("/api/updateRead", async (req, res) => {
  const { messageId, currentUserId } = req.body;

  try {
    // Benutzer basierend auf currentUserId finden
    const user = await User.findOne({ id: currentUserId });

    // Überprüfen, ob der Benutzer gefunden wurde
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Benutzer nicht gefunden",
      });
    }

    // Finden Sie die Benachrichtigung mit der entsprechenden messageId
    const notification = user.notifications.find(
      (notif) => notif.messageId === messageId
    );

    // Überprüfen, ob die Benachrichtigung gefunden wurde
    if (!notification) {
      return res.status(404).send({
        success: false,
        message: "Benachrichtigung nicht gefunden",
      });
    }

    // Setzen Sie den read-Status der Benachrichtigung auf true
    notification.read = true;

    // Markieren Sie das notifications Array als geändert
    user.markModified("notifications");

    // Speichern Sie den aktualisierten Benutzer zurück in die Datenbank
    await user.save();

    res.status(200).send({
      success: true,
      message: "Read erfolgreich in die Datenbank gespeichert",
    });
  } catch (error) {
    console.error(
      "Fehler beim Aktualisieren des Read-Status in der Datenbank:",
      error
    );
    res.status(500).send({
      message: "Fehler beim Aktualisieren des Read-Status in der Datenbank",
    });
  }
});

app.post("/send-notification", async (req, res) => {
  const {
    userId,
    message,
    notificationType,
    benachrichtigungsElementId,
    zielId,
    topicId,
  } = req.body;

  try {
    // Validierung
    if (!zielId || !message) {
      return res.status(400).json({
        error: "Ungültige Anfrage. Benutzer-ID und Nachricht erforderlich.",
      });
    }

    // Benutzer in der Datenbank suchen
    const user = await User.findOne({ id: zielId });
    const startUser = await User.findOne({ id: userId });

    if (!user) {
      console.log("Benutzer nicht gefunden");
      return res.status(404).json({ error: "Benutzer nicht gefunden" });
    }
    const userTokens = user.fcmTokens;
    // Benachrichtigung in der Datenbank speichern
    const notification = {
      message: message,
      sentAt: new Date(),
      read: false,
      notificationType: notificationType,
      title: "",
      benachrichtigungsElementId: benachrichtigungsElementId,
      zielId: zielId,
      userId: userId,
      topicId: topicId,
    };

    const message2 = {
      data: {
        title: "",
        body: "",
        link: "https://c964nzv2-8080.euw.devtunnels.ms/#/notifications",
      },
      tokens: userTokens,
    };

    let title = "";
    let body = "";
    switch (notificationType) {
      case "topiclike":
        title = startUser.name + " liked your post";
        body = startUser.name + " hat Ihren Beitrag geliked.";
        //befüllen der datenbank
        notification.title = title;
        notification.message = body;

        // anzeige der benachrichtigung
        message2.data.title = title;

        break;
      case "topicdislike":
        title = startUser.name + " has disliked your post";
        body = startUser.name + " hat Ihren Beitrag disliked.";
        //befüllen der datenbank
        notification.title = title;
        notification.message = body;

        // anzeige der benachrichtigung
        message2.data.title = title;

        break;
      case "commentdislike":
        title = startUser.name + " has disliked your comment";
        body = startUser.name + " hat Ihren Kommentar disliked.";
        //befüllen der datenbank
        notification.title = title;
        notification.message = body;

        // anzeige der benachrichtigung
        message2.data.title = title;

        break;
      case "commentlike":
        title = startUser.name + " has liked your comment";
        body = startUser.name + " hat Ihren Kommentar geliked.";
        //befüllen der datenbank
        notification.title = title;
        notification.message = body;

        // anzeige der benachrichtigung
        message2.data.title = title;

        break;

      case "replylike":
        title = startUser.name + " liked your answer";
        body = startUser.name + " hat Ihre Antwort geliked.";
        //befüllen der datenbank
        notification.title = title;
        notification.message = body;
        notification.topicId = topicId;
        // anzeige der benachrichtigung
        message2.data.title = title;

        break;
      case "replydislike":
        title = startUser.name + " disliked your answer";
        body = startUser.name + " hat Ihre Antwort disliked.";
        //befüllen der datenbank
        notification.title = title;
        notification.message = body;
        notification.topicId = topicId;

        // anzeige der benachrichtigung
        message2.data.title = title;

        break;
      case "commentaddtotopic":
        title = startUser.name + " wrote a new comment on your post";
        body = startUser.name + " hat ein Kommentar hinzugefügt";
        //befüllen der datenbank
        notification.title = title;
        notification.message = body;
        notification.topicId = topicId;

        // anzeige der benachrichtigung
        message2.data.title = title;

        break;
      case "replyAddToComment":
        title = startUser.name + " wrote a reply to your comment";
        body = startUser.name + " hat ein Kommentar hinzugefügt";
        //befüllen der datenbank
        notification.title = title;
        notification.message = body;

        // anzeige der benachrichtigung
        message2.data.title = title;

        break;
      case "replyAddToReply":
        title = startUser.name + " wrote a reply to your reply";
        body = startUser.name + " hat ein Kommentar hinzugefügt";
        //befüllen der datenbank
        notification.title = title;
        notification.message = body;

        // anzeige der benachrichtigung
        message2.data.title = title;

        break;
      case "chatNotification":
        title = startUser.name + " wrote a message";
        body = startUser.name + " wrote a message";
        //befüllen der datenbank
        notification.title = title;
        notification.message = body;

        // anzeige der benachrichtigung
        message2.data.title = title;

        break;
      case "comment":
        title = "Neuer Kommentar auf Ihrem Beitrag";
        body = "Jemand hat auf Ihren Beitrag kommentiert.";
        break;
      // Fügen Sie hier weitere Cases für verschiedene notificationTypes hinzu

      default:
        title = "Neue Benachrichtigung";
        body = "Sie haben eine neue Benachrichtigung erhalten.";
        break;
    }
    const minutesThreshold = 1; // Setzen Sie hier die gewünschten Minuten ein

    const existingNotification = user.notifications.find(
      (notification) =>
        notification.userId === userId &&
        notification.benachrichtigungsElementId ===
          benachrichtigungsElementId &&
        notification.notificationType === notificationType &&
        notification.sentAt
    );

    let isWithinTimeThreshold = false;

    if (existingNotification) {
      const now = new Date();
      const sendAt = new Date(existingNotification.sentAt); // Stellen Sie sicher, dass sendAt ein Date-Objekt ist
      const diffInMinutes = (now - sendAt) / (1000 * 60);
      isWithinTimeThreshold = diffInMinutes < minutesThreshold;
    }

    if (
      existingNotification &&
      !notificationType.startsWith("chat") &&
      isWithinTimeThreshold
    ) {
      console.log(
        "Benachrichtigung bereits gesendet und ist weniger als 5 Minuten her."
      );
      return res.status(200).json({
        message:
          "Benachrichtigung bereits gesendet und ist weniger als 5 Minuten her.",
      });
    }

    message2.data.objekt = JSON.stringify(notification);
console.log("alter: ", !message2.tokens || message2.tokens.length === 0);
    if (!message2.tokens || message2.tokens.length === 0) {
      console.warn(
        "Warnung: Der Benutzer hat die Benachrichtigung nicht autorisiert.1"
      );
      // Optional: Senden Sie eine Antwort zurück, dass kein Token vorhanden ist, aber als Warnung, nicht als Fehler
      return res.status(200).json({
        warning: "Der Benutzer hat die Benachrichtigung nicht autorisiert.2",
      });
    } else {
      console.log("moruk");
      // Senden der Benachrichtigung, wenn das Token vorhanden ist
      admin
        .messaging()
        .sendMulticast(message2)
        .then(async () => {
          // Response enthält den gesamten Pfad der messageId

          // Extrahieren Sie nur den ID-Teil der messageId
          notification.messageId = uuidv4();
          user.notifications.push(notification);

          await user.save();
          res.status(200).json({
            success: true,
            message: "Benachrichtigung erfolgreich gesendet",
            objekt: notification,
          });
        })
        .catch((error) => {
          console.log("Error sending message:", error);
        });
    }
  } catch (error) {
    console.error("Fehler beim Senden der Benachrichtigung:", error);
    res.status(500).json({ error: "Fehler beim Senden der Benachrichtigung" });
  }
});

app.post("/api/updateBio", async (req, res) => {
  const { editableBiOhneValue, userId } = req.body;
  console.log("amk");
  try {
    const user = await User.findOne({ id: userId });

    if (!user) {
      return res.status(404).send({
        success: false,
        message: "user not found",
      });
    }

    user.bio = editableBiOhneValue;

    user.save();
    // Deine Logik hier

    res.status(200).send({
      success: true,
      message: "Operation successful",
    });
  } catch (error) {
    console.error("Error message", error);
    res.status(500).send({
      message: "Internal Server Error",
    });
  }
});

app.post("/save-token", async (req, res) => {
  try {
    const { userId, token } = req.body;
    console.log("user: ", req.body);
    // Finden Sie den Benutzer in der Datenbank
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Fügen Sie den Token zum Benutzer hinzu, wenn er noch nicht vorhanden ist
    if (!user.fcmTokens.includes(token)) {
      user.fcmTokens.push(token);
      await user.save();
    }

    res.status(200).send({
      success: true,
      message: "Token erfolgreich in der Datenbank gespeichert",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.toString() });
  }
});

function searchReplyInCommentAndReplies(comment, replyId) {
  // Überprüfen Sie zuerst den aktuellen Kommentar

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
    topic.markModified("proComments");
    topic.markModified("contraComments");
    topic.markModified("replies");
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
    topic.markModified("proComments");
    topic.markModified("contraComments");
    topic.markModified("replies");
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
    topic.markModified("proComments");
    topic.markModified("contraComments");
    topic.markModified("replies");
    await topic.save();
    await user.save();

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

// Define your isAdmin middleware
function isAdmin(req, res, next) {
  const user = req.user; // Assuming you have user data in the request object

  if (user && user.role === "admin") {
    // User is an admin; allow access
    next();
  } else {
    // User is not an admin; deny access
    res.status(403).json({ error: "Access denied. Admin role required." });
  }
}

app.get("/api/check-admin", isAdmin, (req, res) => {
  res.json({ isAdmin: true });
});

// Add the isAdmin middleware to the app.delete route
app.delete("/api/comments/:commentId", isAdmin, async (req, res) => {
  const commentId = req.params.commentId;

  try {
    // Find the comment by its ID
    const topic = await Topic.findOne({
      $or: [
        { "proComments.id": commentId },
        { "contraComments.id": commentId },
        { "proComments.replies.id": commentId },
        { "contraComments.replies.id": commentId },
      ],
    });

    if (!topic) {
      return res.status(404).json({ error: "Comment not found" });
    }

    const updateCommentText = (comments) => {
      for (const comment of comments) {
        if (comment.id === commentId) {
          comment.text = "[This has been deleted]";
        }
        if (comment.replies.length > 0) {
          updateCommentText(comment.replies);
        }
      }
    };
    updateCommentText(topic.proComments);
    updateCommentText(topic.contraComments);

    await topic.save();

    res.status(200).json({ message: "Comment updated successfully" });
  } catch (error) {
    console.error("Error updating comment:", error);
    res.status(500).json({ error: "Internal Server Error" });
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

// Add a user to the blocklist
app.post("/api/users/add-to-blocklist", async (req, res) => {
  const userId = req.body.userId; // User ID to block
  const currentUserId = req.body.currentUserId; // ID of the user adding to the blocklist

  try {
    const currentUser = await User.findOne({ id: currentUserId });

    if (!currentUser) {
      return res.status(404).json({ error: "User not found" });
    }

    // Add the user to the blocklist if not already there
    if (!currentUser.blocklist.includes(userId)) {
      currentUser.blocklist.push(userId);
      await currentUser.save();
    }

    res.status(200).json({ message: "User added to blocklist" });
  } catch (error) {
    console.error("Error adding user to blocklist:", error);
    res.status(500).json({ error: "Internal Server Error" });
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
  const reply = req.body.reply;
  const authorId = reply.author;

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
      name: user.name,
      password: user.hashedPassword,
      email: user.email,
    },
  };

  const token = jwt.sign(payload.user, jwtSecretKey, {
    expiresIn: "1h",
  });

  return token;
}

app.post("/verify-token", (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ message: "Token is missing", status: FALSE });
  }
  jwt.verify(token, jwtSecretKey, (err) => {
    if (err) {
      return res
        .status(401)
        .json({ message: "Token is invalid", status: FALSE });
    }
    res.status(200).json({ message: "Token is valid", status: TRUE });
  });
});

app.post("/api/users/login", async (req, res) => {
  const password = req.body.password;
  const email = req.body.email;
  console.log("jwtSecretKey", jwtSecretKey);
  console.log("body: ", req.body);
  console.log("passwort: ", password);
  console.log("email: ", email);
  try {
    // Sanitize user inputs
    const emailSanitized = DOMPurify.sanitize(email);
    const passwordSanitized = DOMPurify.sanitize(password);

    // Find the user by name in the database
    const user = await User.findOne({ email: emailSanitized });

    if (!user) {
      return res.status(401).send({ message: "User not found" });
    }
    console.log("user; ", user);
    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(
      passwordSanitized,
      user.hashedPassword
    );
    if (!isPasswordValid) {
      return res.status(401).send({ message: "Invalid password" });
    }

    // Generate a JWT token
    const token = generateAuthToken(user);

    res.status(200).send({ success: true, token, userId: user.id });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).send({ message: "Error logging in" });
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

app.post("/api/users/register", async (req, res) => {
  try {
    const userData = req.body;

    // Sanitize user input
    const sanitizedName = DOMPurify.sanitize(userData.name);
    const sanitizedPassword = DOMPurify.sanitize(userData.password);
    // Check if a user with the same name already exists
    const existingUser = await User.findOne({ name: sanitizedName });
    if (existingUser) {
      return res.status(400).send({
        success: false,
        message: "User with this name already exists",
      });
    }

    // Get the next available user ID
    const nextUserId = await getNextUserId();

    // Set the id and joinedAt fields of the userData
    userData.id = nextUserId;
    userData.joinedAt = new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    // Generate a salt and hash the user's password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(sanitizedPassword, saltRounds);

    // Replace the plain password with the hashed password
    userData.hashedPassword = hashedPassword;

    // Create a new user document with the sanitized data
    const user = new User({
      name: sanitizedName,
      hashedPassword: hashedPassword,
      joinedAt: userData.joinedAt,
      id: userData.id,
    });
    await user.save();

    const token = jwt.sign({ userData }, jwtSecretKey, {
      expiresIn: "1h",
    });

    res.status(200).json({
      token,
      user: user,
      success: true,
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).send({ success: false, message: "Error registering user" });
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
  const { comment, author } = req.body;

  try {
    console.log(comment.topicId);
    const user = await User.findOne({ id: author.id });
    const topic = await Topic.findOne({ id: comment.topicId });
    if (!topic) {
      return res.status(404).json({ error: "Thema nicht gefunden" });
    }

    // Fügen Sie den neuen Kommentar zum Thema hinzu
    if (comment.commentType == "pro") {
      topic.proComments.push(comment);
      user.procreated.push(comment.id);
    }

    if (comment.commentType == "contra") {
      topic.contraComments.push(comment);
      user.contracreated.push(comment.id);
    }

    if (!user) {
      return res.status(404).json({ error: "User nicht gefunden" });
    }

    // Speichern Sie das aktualisierte Thema in der Datenbank
    await topic.save();
    await user.save();
    // Senden Sie eine Erfolgsantwort zurück
    res.status(200).json({ message: "Kommentar erfolgreich hinzugefügt" });
  } catch (error) {
    console.error("Fehler beim Hinzufügen des Kommentars:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});

app.post("/api/addTopicToSaves", async (req, res) => {
  const path = req.body.path;
  const currentUserId = req.body.currentUserId;

  try {
    const user = await User.findOne({ id: currentUserId });
    if (!user) {
      return res.status(404).json({ error: "Benutzer nicht gefunden" });
    }

    console.log(path + " path");

    // Überprüfen, ob das Thema bereits gespeichert ist
    const index = user.topicsaves.indexOf(path);
    if (index !== -1) {
      // Wenn es bereits gespeichert ist, entfernen Sie es aus der Liste
      user.topicsaves.splice(index, 1);
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "Topic erfolgreich entfernt" });
    } else {
      // Wenn es noch nicht gespeichert ist, fügen Sie es zur Liste hinzu
      user.topicsaves.push(path);
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "Topic erfolgreich hinzugefügt" });
    }
  } catch (error) {
    console.error("Fehler beim Hinzufügen/Entfernen des Topics:", error);
    res.status(500).json({ error: "Interner Serverfehler" });
  }
});
app.post("/api/updatechatsid", async (req, res) => {
  const { chatId, currentUserId } = req.body;
  try {
    // Find entity based on payloadVariable2
    const entity = await User.findOne({ id: currentUserId });

    // Check if the entity was found
    if (!entity) {
      return res.status(404).send({
        success: false,
        message: "Entity nicht gefunden",
      });
    }

    // Process the entity's data
    entity.activeChats.push(chatId);

    // Mark the data array as modified
    entity.markModified("activeChats");

    // Save the updated entity back to the database
    await entity.save();

    res.status(200).send({
      success: true,
      message: "Daten erfolgreich in die Datenbank gespeichert",
    });
  } catch (error) {
    console.error(
      "Fehler beim Aktualisieren der Daten in der Datenbank:",
      error
    );
    res.status(500).send({
      message: "Fehler beim Aktualisieren der Daten in der Datenbank",
    });
  }
});

cron.schedule("0 3 * * 0", () => {
  const currentDate = new Date();
  // Überprüfen, ob der aktuelle Tag ein erster Sonntag im Monat ist
  if (currentDate.getDate() <= 7) {
    console.log(
      "Dieser Cronjob wird am ersten Sonntag des Monats um 3 Uhr morgens ausgeführt."
    );
    clean();
  }
});
