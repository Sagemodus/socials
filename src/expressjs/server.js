const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json()); // Add this line to parse JSON requests

// MongoDB connection URL
const uri = 'mongodb://localhost:27017';

// Initialize MongoDB client
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connectToMongoDB() {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('Error connecting to MongoDB:', err);
  }
}

// Connect to MongoDB
connectToMongoDB();

// Define the registration route
app.post('/api/register', async (req, res) => {
  try {
    // Your registration logic here

    // Send a success response
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Define your API routes and functionality here

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
