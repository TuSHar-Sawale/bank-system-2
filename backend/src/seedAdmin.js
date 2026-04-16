// Run this ONCE to create the first admin: node src/seedAdmin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

const User = require("./models/User");

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const exists = await User.findOne({ email: "admin@bank.com" });
  if (exists) {
    console.log("Admin already exists!");
    process.exit();
  }

  await User.create({
    name: "Admin",
    email: "admin@bank.com",
    password: "Admin@1234",
    role: "admin",
    isActive: true,
  });

  console.log("✅ Admin created: admin@bank.com / Admin@1234");
  process.exit();
};

seed().catch((err) => { console.error(err); process.exit(1); });
