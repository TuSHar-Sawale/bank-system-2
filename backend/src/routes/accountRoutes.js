const express = require("express");
const router = express.Router();
const { getMyAccount, updateProfile } = require("../controllers/accountController");
const { protect } = require("../middleware/authMiddleware");

router.get("/", protect, getMyAccount);
router.put("/profile", protect, updateProfile);

module.exports = router;
