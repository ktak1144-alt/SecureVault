const express = require("express");
const router = express.Router();
const {
  setup2FA,
  verify2FA,
  validate2FA,
  disable2FA,
  get2FAStatus
} = require("../controllers/twoFactorController");
const { protect } = require("../middleware/authMiddleware");

// Protected routes
router.get("/setup", protect, setup2FA);
router.post("/verify", protect, verify2FA);
router.post("/validate", validate2FA);
router.post("/disable", protect, disable2FA);
router.get("/status", protect, get2FAStatus);

module.exports = router;