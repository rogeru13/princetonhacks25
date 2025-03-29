// server.js
const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// Connect Database
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));

// Define Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/patients', require('./routes/patients'));
app.use('/api/providers', require('./routes/providers'));
app.use('/api/insurance', require('./routes/insurance'));
app.use('/api/watches', require('./routes/watches'));
app.use('/api/logs', require('./routes/logs'));

// Basic route for checking API status
app.get('/', (req, res) => {
  res.json({ message: 'Health Monitor API is running' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

