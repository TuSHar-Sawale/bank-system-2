const Account = require("../models/Account");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// Search users by name for transfer
const searchUsers = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.json([]);

    const users = await User.find({
      name: { $regex: name, $options: "i" },
      role: "customer",
      _id: { $ne: req.user._id } // Don't show yourself
    }).limit(5);

    const results = await Promise.all(users.map(async (u) => {
      const acc = await Account.findOne({ userId: u._id });
      return { name: u.name, accountId: acc?.accountId };
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deposit = async (req, res) => {
  try {
    const { amount } = req.body;
    let account = await Account.findOne({ userId: req.user._id });

    if (!account) {
      account = await Account.create({ userId: req.user._id, status: "active", balance: 0 });
    }

    account.balance += Number(amount);
    await account.save();

    const txn = await Transaction.create({
      receiverId: account._id,
      amount,
      type: "deposit",
      description: "Cash deposit",
    });

    res.json({ message: "Deposit successful", balance: account.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const withdraw = async (req, res) => {
  try {
    const { amount } = req.body;
    const account = await Account.findOne({ userId: req.user._id });
    if (!account || account.balance < amount) return res.status(400).json({ message: "Insufficient funds" });

    account.balance -= Number(amount);
    await account.save();

    await Transaction.create({ senderId: account._id, amount, type: "withdrawal" });
    res.json({ message: "Success", balance: account.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const transfer = async (req, res) => {
  try {
    const { toAccountId, amount } = req.body;
    const sender = await Account.findOne({ userId: req.user._id });
    const receiver = await Account.findOne({ accountId: toAccountId });

    if (!receiver) return res.status(404).json({ message: "Recipient not found" });
    if (sender.balance < amount) return res.status(400).json({ message: "Insufficient balance" });

    sender.balance -= Number(amount);
    receiver.balance += Number(amount);

    await sender.save();
    await receiver.save();

    await Transaction.create({
      senderId: sender._id,
      receiverId: receiver._id,
      amount,
      type: "transfer"
    });

    res.json({ message: "Transfer successful", balance: sender.balance });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTransactions = async (req, res) => {
  try {
    const account = await Account.findOne({ userId: req.user._id });
    const txns = await Transaction.find({
      $or: [{ senderId: account._id }, { receiverId: account._id }]
    }).sort({ createdAt: -1 });
    res.json(txns);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { deposit, withdraw, transfer, getTransactions, searchUsers };
