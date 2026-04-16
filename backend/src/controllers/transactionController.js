const Account = require("../models/Account");
const Transaction = require("../models/Transaction");

// POST /api/transactions/deposit
// POST /api/transactions/deposit
const deposit = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    // Look for the account
    let account = await Account.findOne({ userId: req.user._id });

    // FIX: If account doesn't exist, create it now
    if (!account) {
      account = await Account.create({ 
        userId: req.user._id, 
        status: "active", 
        balance: 0 
      });
    }

    if (account.status !== "active") {
        return res.status(403).json({ message: "Account is frozen or inactive" });
    }

    account.balance += Number(amount);
    await account.save();

    const txn = await Transaction.create({
      receiverId: account._id,
      amount,
      type: "deposit",
      description: "Cash deposit",
    });

    res.json({ message: "Deposit successful", balance: account.balance, transaction: txn });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/transactions/withdraw
const withdraw = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: "Invalid amount" });

    const account = await Account.findOne({ userId: req.user._id });
    if (!account) return res.status(404).json({ message: "Account not found" });
    if (account.status !== "active") return res.status(403).json({ message: "Account is not active" });
    if (account.balance < amount) return res.status(400).json({ message: "Insufficient balance" });

    account.balance -= Number(amount);
    await account.save();

    const txn = await Transaction.create({
      senderId: account._id,
      amount,
      type: "withdrawal",
      description: "Cash withdrawal",
    });

    res.json({ message: "Withdrawal successful", balance: account.balance, transaction: txn });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/transactions/transfer
const transfer = async (req, res) => {
  try {
    const { toAccountId, amount, description } = req.body;
    if (!toAccountId || !amount || amount <= 0)
      return res.status(400).json({ message: "Invalid transfer details" });

    const senderAccount = await Account.findOne({ userId: req.user._id });
    if (!senderAccount) return res.status(404).json({ message: "Your account not found" });
    if (senderAccount.status !== "active") return res.status(403).json({ message: "Your account is not active" });
    if (senderAccount.balance < amount) return res.status(400).json({ message: "Insufficient balance" });

    const receiverAccount = await Account.findOne({ accountId: toAccountId });
    if (!receiverAccount) return res.status(404).json({ message: "Recipient account not found" });
    if (receiverAccount.status !== "active") return res.status(403).json({ message: "Recipient account is not active" });
    if (senderAccount._id.equals(receiverAccount._id))
      return res.status(400).json({ message: "Cannot transfer to same account" });

    senderAccount.balance -= Number(amount);
    receiverAccount.balance += Number(amount);
    await senderAccount.save();
    await receiverAccount.save();

    const txn = await Transaction.create({
      senderId: senderAccount._id,
      receiverId: receiverAccount._id,
      amount,
      type: "transfer",
      description: description || "Fund transfer",
    });

    res.json({ message: "Transfer successful", balance: senderAccount.balance, transaction: txn });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/transactions
const getTransactions = async (req, res) => {
  try {
    const account = await Account.findOne({ userId: req.user._id });
    if (!account) return res.status(404).json({ message: "Account not found" });

    const { type, startDate, endDate } = req.query;
    const filter = {
      $or: [{ senderId: account._id }, { receiverId: account._id }],
    };
    if (type) filter.type = type;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { deposit, withdraw, transfer, getTransactions };
