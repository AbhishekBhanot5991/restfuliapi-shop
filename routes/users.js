// routes/users.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

// Signup route
router.post('/signup', async (req, res) => {
    try {
      console.log('Signup route hit');
      const { email, password } = req.body;
      console.log('Email:', email);
  
      const newUser = new User({ email, password });
      newUser.password = await newUser.generateHash(password); // Call generateHash on the instance
  
      await newUser.save();
      console.log('User saved');
  
      res.json({ message: 'Signup successful' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ message: 'Error signing up', error: error.message });
    }
  });

// Login route
router.post('/login', passport.authenticate('local', { session: false }), (req, res) => {
    const token = jwt.sign({ sub: req.user._id }, process.env.JWT_SECRET);
    res.json({ token });
  });
  

module.exports = router;
