const User = require("../models/User");
const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "customer" }).select("-password");
    const usersWithAccounts = await Promise.all(
      users.map(async (user) => {
        const account = await Account.findOne({ userId: user._id });
        return { ...user.toObject(), account };
      })
    );
    res.json(usersWithAccounts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/approve/:userId  - approve user and activate account
const approveUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = true;
    await user.save();

    await Account.findOneAndUpdate({ userId: user._id }, { status: "active" });

    res.json({ message: `User ${user.name} approved and account activated` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/freeze/:accountId
const freezeAccount = async (req, res) => {
  try {
    const account = await Account.findOne({ accountId: req.params.accountId });
    if (!account) return res.status(404).json({ message: "Account not found" });

    account.status = account.status === "frozen" ? "active" : "frozen";
    await account.save();

    res.json({ message: `Account ${account.status}`, account });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/transactions
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .populate("senderId", "accountId")
      .populate("receiverId", "accountId");
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/stats
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: "customer" });
    const activeAccounts = await Account.countDocuments({ status: "active" });
    const pendingAccounts = await Account.countDocuments({ status: "pending" });
    const frozenAccounts = await Account.countDocuments({ status: "frozen" });
    const totalTransactions = await Transaction.countDocuments();

    const balanceAgg = await Account.aggregate([
      { $group: { _id: null, total: { $sum: "$balance" } } },
    ]);
    const totalBalance = balanceAgg[0]?.total || 0;

    res.json({
      totalUsers,
      activeAccounts,
      pendingAccounts,
      frozenAccounts,
      totalTransactions,
      totalBalance,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllUsers, approveUser, freezeAccount, getAllTransactions, getDashboardStats };
