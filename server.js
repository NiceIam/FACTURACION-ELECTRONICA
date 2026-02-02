const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dian_invoicing')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/companies', require('./routes/companies'));
app.use('/api/invoices', require('./routes/invoices'));

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