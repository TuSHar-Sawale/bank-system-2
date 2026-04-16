const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      unique: true,
      default: () => "ACC" + Date.now() + Math.floor(Math.random() * 1000),
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    balance: { type: Number, default: 0, min: 0 },
    accountType: {
      type: String,
      enum: ["savings", "checking"],
      default: "savings",
    },
    status: {
      type: String,
      enum: ["active", "frozen", "pending"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
