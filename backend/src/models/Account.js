const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    // Use accountId consistently
    accountId: {
      type: String,
      unique: true,
      // This function generates a unique number every time
      default: () => "ACC" + Math.floor(100000 + Math.random() * 900000), 
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    balance: { type: Number, default: 0 },
    accountType: { type: String, default: "savings" },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", accountSchema);
