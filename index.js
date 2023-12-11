const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
// app.use(bodyParser.json());
app.use(express.json());

// Routes
const productsRouter = require('./routes/products');
app.use('/api/products', productsRouter);

// Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true,  retryWrites: true, w: 'majority'  });
mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1); // Exit the application with an error code
});
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
