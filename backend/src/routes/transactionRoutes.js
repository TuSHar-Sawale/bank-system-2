const express = require("express");
const router = express.Router();
const { deposit, withdraw, transfer, getTransactions } = require("../controllers/transactionController");
const { protect } = require("../middleware/authMiddleware");

router.post("/deposit", protect, deposit);
router.post("/withdraw", protect, withdraw);
router.post("/transfer", protect, transfer);
router.get("/", protect, getTransactions);

module.exports = router;
