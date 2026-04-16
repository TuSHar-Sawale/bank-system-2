const User = require("../models/User");
const Account = require("../models/Account");
const jwt = require("jsonwebtoken");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, isActive: true });

    // We do NOT pass accountId here; let the Model's 'default' function handle it
    await Account.create({ 
      userId: user._id, 
      balance: 0, 
      status: "active" 
    });

    res.status(201).json({ message: "Success" });
  } catch (err) {
    // This will help you see exactly which field is failing
    console.error("Registration Error:", err); 
    res.status(500).json({ message: err.message });
  }
};

    // 2. Create the Account immediately with status 'active'
    await Account.create({ 
      userId: user._id, 
      accountType: "savings",
      status: "active", // Set to active immediately
      balance: 0 
    });

    res.status(201).json({
      message: "Registration successful. You can now login.",
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

    if (!user.isActive && user.role !== "admin")
      return res.status(403).json({ message: "Account pending admin approval" });

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

module.exports = { register, login, getMe };
