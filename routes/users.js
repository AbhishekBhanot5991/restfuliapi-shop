// routes/users.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Access denied. Token not provided.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: 'Invalid token.' });

      req.user = user;
      next();
  });
}

// Protected route that requires authentication
router.get('/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route.' });
});

// Signup route
router.post('/signup', async (req, res) => {
  try {
    console.log('Signup route hit');
    const { email, password, confirmPassword } = req.body;
    console.log('Email:', email);
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Missing required fields: email, password, and confirmation password.' });
    }
    // Check if password and confirmation password match
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirmation password do not match.' });
    }

    // Create a new user instance
    const newUser = new User({ email });

    // Generate hash for the password and set it in the user instance
    newUser.password = await newUser.generateHash(password);

    // Save the user
    await newUser.save();

    res.json({ message: 'Signup successful' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error signing up', error: error.message });
  }
});

// Login route
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
  try {
      const token = jwt.sign({ sub: req.user._id }, process.env.JWT_SECRET);
      res.json({ token });
  } catch (error) {
      console.error('Error generating JWT token:', error);
      res.status(500).json({ message: 'Error generating JWT token' });
  }
});
  

module.exports = router;
