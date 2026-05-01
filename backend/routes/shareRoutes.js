const express = require("express");
const router = express.Router();
const {
  generateShareLink,
  accessSharedFile,
  revokeShareLink,
  getShareDetails
} = require("../controllers/shareController");
const { protect } = require("../middleware/authMiddleware");

// Protected routes (need login)
router.post("/generate", protect, generateShareLink);
router.delete("/revoke/:fileId", protect, revokeShareLink);
router.get("/details/:fileId", protect, getShareDetails);

// Public route (no login needed — anyone with link can access)
router.get("/:token", accessSharedFile);

module.exports = router;