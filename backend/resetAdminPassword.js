// resetAdminPassword.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("./models/User"); // adjust path if different

const SALT_ROUNDS = 10;

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

  // create a fresh bcrypt hash and save (this uses same bcrypt as your model)
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(plain, salt);

  user.password = hash;
  user.isApproved = true;
  user.role = "admin";
  user.isBanned = false;

  await user.save();
  console.log(`Password for '${username}' reset to '${plain}' (hashed and saved).`);

  // Optional: test compare here and print result
  const match = await bcrypt.compare(plain, user.password);
  console.log("Local bcrypt compare result:", match);

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(err => {
  console.error("Error:", err);
  process.exit(1);
});
