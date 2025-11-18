// resetAdminPassword.js
require("dotenv").config();
const mongoose = require("mongoose");

const User = require("./models/User"); // adjust path if different



async function run() {
  if (!process.env.MONGO_URI) {
    console.error("Set MONGO_URI in .env");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log("Connected to DB:", mongoose.connection.name);

  const username = "admin123";
  const plain = "admin123";

  const user = await User.findOne({ username });
  if (!user) {
    console.error("User not found:", username);
    await mongoose.disconnect();
    process.exit(1);
  }

  // Directly assign plain password (no hashing)
  user.password = plain;
  user.isApproved = true;
  user.role = "admin";
  user.isBanned = false;

  await user.save();
  console.log(`Password for '${username}' reset to '${plain}' (hashed and saved).`);



  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
