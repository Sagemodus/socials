const Topic = require("./models/topic");
const Comment = require("./models/comment");
const Reply = require("./models/reply");
const User = require("./models/user");
const express = require("express");
const mongoose = require("mongoose");
const { insertData } = require("./utils/databaseUtils");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // Add this line to parse JSON requests

// MongoDB connection URL
const uri = "mongodb://localhost:27017";

// Initialize MongoDB client

async function connectToMongoDB() {
  try {
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  }
}

// Connect to MongoDB
connectToMongoDB();

app.post("/api/addTopics", async (req, res) => {
  try {
    // Empfangen Sie die Daten aus dem Request Body
    const dataToInsert = req.body;

    // Fügen Sie die Daten in Ihre MongoDB-Datenbank ein
    // Hier sollten Sie Ihr Mongoose-Modell verwenden, um die Daten einzufügen
    const newTopic = new Topic(dataToInsert);

    newTopic.validate((error) => {
      if (error) {
        console.error("Ungültige Daten:", error);
        res.status(400).json({ message: "Ungültige Daten" });
      } else {
        newTopic
          .save()
          .then(() => {
            console.log("Daten erfolgreich in die Datenbank geladen");
            res
              .status(201)
              .json({ message: "Daten erfolgreich in die Datenbank geladen" });
          })
          .catch((saveError) => {
            console.error(
              "Fehler beim Speichern der Daten in die Datenbank:",
              saveError
            );
            res.status(500).json({ message: "Internal server error" });
          });
      }
    });
  } catch (error) {
    console.error("Fehler beim Laden der Daten in die Datenbank:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

insertData()
  .then(() => {
    console.log("Daten erfolgreich in die Datenbank geladen");
  })
  .catch((error) => {
    console.error("Fehler beim Laden der Daten in die Datenbank:", error);
  });

// Define the registration route
app.post("/api/register", async (req, res) => {
  try {
    // Your registration logic here

    // Send a success response
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Define your API routes and functionality here

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
