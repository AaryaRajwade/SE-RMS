// routes/auth.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");

// REGISTER (user signs up → waits for admin approval)
router.post("/register", async (req, res) => {
  try {
    const { name, username, password, email, defaultPincode } = req.body;

    // Check if username or email already exists
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.status(400).json({ message: "Username or Email already exists" });
    }

    // Create new user with isApproved=false
    const newUser = new User({
      name,
      username,
      password,
      email,
      defaultPincode,
      role: "user",
      isApproved: false, // MUST be approved by admin
      isBanned: false
    });

    await newUser.save();

    res.json({
      message: "Registration request sent. Wait for admin approval.",
      userId: newUser._id
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});



// LOGIN (only approved + not banned users)
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check approval
    if (!user.isApproved)
      return res.status(403).json({ message: "Your account is not approved yet" });

    // Check banned
    if (user.isBanned)
      return res.status(403).json({ message: "Your account is banned" });

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role
      }
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
