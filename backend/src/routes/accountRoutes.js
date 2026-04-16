const express = require("express");
const router = express.Router();
const { getMyAccount, searchAccounts } = require("../controllers/accountController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMyAccount);
router.get("/search", protect, searchAccounts);

module.exports = router;
