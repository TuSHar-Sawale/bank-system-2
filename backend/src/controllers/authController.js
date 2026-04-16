const User = require("../models/User");
const Account = require("../models/Account");
const jwt = require("jsonwebtoken");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, isActive: true });

    // Auto-create an ACTIVE account immediately
    await Account.create({ userId: user._id, accountType: "savings", status: "active" });

    res.status(201).json({
      message: "Registration successful! You can now log in.",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = req.user;
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
};

// PUT /api/auth/profile - update name and/or password
const updateProfile = async (req, res) => {
  try {
    const { name, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;

    if (currentPassword && newPassword) {
      const match = await user.matchPassword(currentPassword);
      if (!match) return res.status(400).json({ message: "Current password is incorrect" });
      if (newPassword.length < 6) return res.status(400).json({ message: "New password must be at least 6 characters" });
      user.password = newPassword;
    }

    await user.save();
    res.json({ message: "Profile updated successfully", user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getMe, updateProfile };
