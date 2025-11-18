// routes/admin.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { authMiddleware, isAdmin } = require("../middleware/authMiddleware");

// APPROVE USER
router.post("/approve/:userId", authMiddleware, isAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.isApproved = true;
    await user.save();

    res.json({ message: "User approved successfully" });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET PENDING USERS (waiting for approval)
router.get("/pending-users", authMiddleware, isAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.find({ isApproved: false, role: "user" }).select("-password");
    res.json(pendingUsers);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET ALL USERS (for admin management)
router.get("/all-users", authMiddleware, isAdmin, async (req, res) => {
  try {
    const allUsers = await User.find({ role: "user" }).select("-password");
    res.json(allUsers);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// BAN USER BY USERNAME
router.post("/ban", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ username });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.isBanned = true;
    await user.save();

    res.json({ message: `User '${username}' banned successfully` });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

// UNBAN USER BY USERNAME
router.post("/unban", authMiddleware, isAdmin, async (req, res) => {
  try {
    const { username } = req.body;

    const user = await User.findOne({ username });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    user.isBanned = false;
    await user.save();

    res.json({ message: `User '${username}' unbanned successfully` });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
