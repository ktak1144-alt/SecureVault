const File = require("../models/File");
const { decryptFile } = require("../utils/encryption");
const { v4: uuidv4 } = require("uuid");
const { sendShareNotification } = require("../utils/emailService");

// ✅ GENERATE SHARE LINK
const generateShareLink = async (req, res) => {
  try {
    const { fileId, expiryHours, accessLimit } = req.body;

    // Find file and verify ownership
    const file = await File.findOne({
      _id: fileId,
      owner: req.user.id,
    });

    if (!file) {
      return res.status(404).json({ message: "File not found!" });
    }

    // Generate unique share token
    const shareToken = uuidv4();

    // Set expiry time
    const shareExpiry = new Date();
    shareExpiry.setHours(shareExpiry.getHours() + (expiryHours || 24));

    // Update file with share details
    file.shareToken = shareToken;
    file.shareExpiry = shareExpiry;
    file.shareAccessLimit = accessLimit || null;
    file.shareAccessCount = 0;
    file.isPublic = true;

    await file.save();

    // Generate share link
    const shareLink = `http://localhost:5000/api/share/${shareToken}`;

    // Send share notification email
    await sendShareNotification({
      ownerName: req.user.name || "User",
      fileName: file.originalName,
      shareLink,
      expiresAt: shareExpiry,
    });

    res.status(200).json({
      message: "✅ Share link generated!",
      shareLink,
      expiresAt: shareExpiry,
      accessLimit: accessLimit || "Unlimited",
    });
    
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error generating link", error: error.message });
  }
};

// ✅ ACCESS SHARED FILE
const accessSharedFile = async (req, res) => {
  try {
    const { token } = req.params;

    // Find file by share token
    const file = await File.findOne({ shareToken: token });

    if (!file) {
      return res.status(404).json({ message: "❌ Invalid or expired link!" });
    }

    // Check if link has expired
    if (file.shareExpiry && new Date() > file.shareExpiry) {
      file.isPublic = false;
      file.shareToken = null;
      await file.save();
      return res.status(403).json({ message: "❌ This link has expired!" });
    }

    // Check access limit
    if (
      file.shareAccessLimit &&
      file.shareAccessCount >= file.shareAccessLimit
    ) {
      return res
        .status(403)
        .json({ message: "❌ Access limit reached for this link!" });
    }

    // Increment access count
    file.shareAccessCount += 1;
    await file.save();

    // Decrypt and send file
    const fileBuffer = decryptFile(file.encryptedPath);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.originalName}"`,
    );
    res.setHeader("Content-Type", file.mimetype);
    res.send(fileBuffer);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error accessing file", error: error.message });
  }
};

// ✅ REVOKE SHARE LINK
const revokeShareLink = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.fileId,
      owner: req.user.id,
    });

    if (!file) {
      return res.status(404).json({ message: "File not found!" });
    }

    // Remove share details
    file.shareToken = null;
    file.shareExpiry = null;
    file.shareAccessLimit = null;
    file.shareAccessCount = 0;
    file.isPublic = false;

    await file.save();

    res.status(200).json({ message: "✅ Share link revoked successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error revoking link", error: error.message });
  }
};

// ✅ GET SHARE DETAILS
const getShareDetails = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.fileId,
      owner: req.user.id,
    });

    if (!file) {
      return res.status(404).json({ message: "File not found!" });
    }

    if (!file.isPublic) {
      return res.status(200).json({ message: "File is not shared!" });
    }

    res.status(200).json({
      message: "✅ Share details fetched!",
      shareLink: `http://localhost:5000/api/share/${file.shareToken}`,
      expiresAt: file.shareExpiry,
      accessLimit: file.shareAccessLimit || "Unlimited",
      accessCount: file.shareAccessCount,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching details", error: error.message });
  }
};

module.exports = {
  generateShareLink,
  accessSharedFile,
  revokeShareLink,
  getShareDetails,
};
