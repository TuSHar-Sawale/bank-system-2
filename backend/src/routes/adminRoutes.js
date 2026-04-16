const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  approveUser,
  freezeAccount,
  getAllTransactions,
  getDashboardStats,
} = require("../controllers/adminController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.use(protect, adminOnly);

router.get("/users", getAllUsers);
router.put("/approve/:userId", approveUser);
router.put("/freeze/:accountId", freezeAccount);
router.get("/transactions", getAllTransactions);
router.get("/stats", getDashboardStats);

module.exports = router;
