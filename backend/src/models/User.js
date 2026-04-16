const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    // Ensure this matches exactly what you use in your controllers
    accountId: {
      type: String,
      unique: true,
      // This function generates a unique ID if one isn't provided
      default: () => "ACC" + Date.now() + Math.floor(Math.random() * 1000),
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    balance: { type: Number, default: 0 },
    accountType: { type: String, default: "savings" },
    status: { type: String, default: "active" }, // We set this to active by default now
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
