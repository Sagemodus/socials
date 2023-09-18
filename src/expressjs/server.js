// backend/server.js
const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

// Define your API routes and functionality here

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


// ...

// Define an API route
app.get('/api/message', (req, res) => {
    res.json({ message: 'Hello from the backend!' });
  });
  
  // ...
  