// debugAdminCheck.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

async function run() {
  if (!process.env.MONGO_URI) {
    console.log("MONGO_URI missing");
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB:", mongoose.connection.name);

  const u = await User.findOne({ username: "admin123" }).lean();
  console.log("\n--- USER DOCUMENT FOUND IN DB ---");
  console.log(u);
  console.log("---------------------------------\n");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
