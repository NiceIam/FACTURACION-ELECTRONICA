const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'DIAN Electronic Invoicing API',
    version: '0.1.0',
    status: 'OK'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});