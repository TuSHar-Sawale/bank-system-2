const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      unique: true,
      default: () => "TXN" + Date.now() + Math.floor(Math.random() * 9999),
    },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    amount: { type: Number, required: true, min: 0.01 },
    type: {
      type: String,
      enum: ["deposit", "withdrawal", "transfer"],
      required: true,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
