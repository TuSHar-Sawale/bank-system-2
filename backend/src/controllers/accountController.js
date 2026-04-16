const Account = require("../models/Account");

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

// PUT /api/account/profile - update user name
const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    req.user.name = name || req.user.name;
    await req.user.save();
    res.json({ message: "Profile updated", name: req.user.name });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getMyAccount, updateProfile };
