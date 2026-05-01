const express = require("express");
const router = express.Router();
const {
  uploadFile,
  getMyFiles,
  downloadFile,
  deleteFile
} = require("../controllers/fileController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// All routes are protected
router.post("/upload", protect, upload.single("file"), uploadFile);
router.get("/my-files", protect, getMyFiles);
router.get("/download/:id", protect, downloadFile);
router.delete("/delete/:id", protect, deleteFile);

module.exports = router;