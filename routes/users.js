const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const token = req.header("Authorization");
  if (!token)
    return res
      .status(401)
      .json({ message: "Access denied. Token not provided." });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid token." });

    req.user = user;
    next();
  });
}

// Signup route
router.post("/signup", async (req, res) => {
  try {
    console.log("Signup route hit");
    const { email, password } = req.body;
    console.log("Email:", email);

    const newUser = new User({ email, password });
    await newUser.generateHash(password);
    await newUser.save();
    // console.log('User saved');

    res.json({ message: "Signup successful" });
  } catch (error) {
    console.error("Error signing up:", error.message);
    res.status(500).json({ message: "Error signing up", error: error.message });
  }
});

// Login route
router.post(
  "/login",
  passport.authenticate("local", { session: false }),
  (req, res) => {
    try {
      const token = jwt.sign({ sub: req.user._id }, process.env.JWT_SECRET);
      res.json({ token });
    } catch (error) {
      console.error("Error generating JWT token:", error);
      res.status(500).json({ message: "Error generating JWT token" });
    }
  }
);

module.exports = router;
