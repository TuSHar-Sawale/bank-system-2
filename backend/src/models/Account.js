const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    accountId: {
      type: String,
      unique: true,
      // Generates a random account number like ACC123456
      default: () => "ACC" + Math.floor(100000 + Math.random() * 900000), 
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    balance: { type: Number, default: 0 },
    accountType: { type: String, enum: ["savings", "checking"], default: "savings" },
    status: { type: String, enum: ["active", "frozen"], default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
