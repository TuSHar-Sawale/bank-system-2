const Account = require("../models/Account");
const User = require("../models/User");

// GET /api/account  - get logged-in user's account
const getMyAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ userId: req.user._id });
    if (!account) return res.status(404).json({ message: "Account not found" });
    res.json(account);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/account/search?name=john  - search accounts by user name for transfer
const searchAccounts = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name || name.trim().length < 2)
      return res.status(400).json({ message: "Enter at least 2 characters to search" });

    // Find users whose name matches (case-insensitive), excluding the requester
    const users = await User.find({
      name: { $regex: name.trim(), $options: "i" },
      _id: { $ne: req.user._id },
      role: "customer",
    }).select("_id name email");

    if (users.length === 0) return res.json([]);

    // Get their active accounts
    const results = await Promise.all(
      users.map(async (u) => {
        const account = await Account.findOne({ userId: u._id, status: "active" });
        if (!account) return null;
        return {
          accountId: account.accountId,
          accountType: account.accountType,
          userName: u.name,
          userEmail: u.email,
        };
      })
    );

    res.json(results.filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyAccount, searchAccounts };
