const File = require("../models/File");
const User = require("../models/User");
const {
  encryptAndUploadToS3,
  downloadAndDecryptFromS3,
  deleteFromS3,
} = require("../utils/s3Storage");
const { createLog } = require("../utils/auditLogger");
const { getAICategory } = require("../utils/aiService");
const path = require("path");
const fs = require("fs");

//  UPLOAD FILE
const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    const { path: filePath, originalname, mimetype, size } = req.file;
    const ip = req.ip || req.connection.remoteAddress;

    // Encrypt and upload to S3
    const s3Key = await encryptAndUploadToS3(filePath, originalname, mimetype);

    // AI Categorization
    console.log("🤖 Running AI categorization...");
    const aiResult = await getAICategory(originalname, mimetype, size);
    console.log(`🤖 AI Categorized: ${originalname} → ${aiResult.category}`);

    // Save to database with AI data
    const file = new File({
      filename: path.basename(s3Key),
      originalName: originalname,
      mimetype,
      size,
      s3Key,
      storageType: "s3",
      owner: req.user.id,
      aiCategory: aiResult.category,
      aiDescription: aiResult.description,
      aiTags: aiResult.tags,
      aiCategorizedAt: new Date(),
    });

    await file.save();

    // Update user storage
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { storageUsed: size },
    });

    // Log action
    await createLog({
      user: req.user.id,
      action: "FILE_UPLOAD",
      description: `File uploaded to S3 & encrypted: ${originalname}`,
      ipAddress: ip,
      userAgent: req.headers["user-agent"],
      status: "SUCCESS",
    });

    res.status(201).json({
      message: "✅ File uploaded to cloud and encrypted successfully!",
      file: {
        id: file._id,
        name: file.originalName,
        size: file.size,
        uploadedAt: file.createdAt,
        storage: "AWS S3 ☁️",
        aiCategory: aiResult.category,
        aiDescription: aiResult.description,
        aiTags: aiResult.tags,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Upload failed!", error: error.message });
  }
};

//  GET ALL FILES
const getMyFiles = async (req, res) => {
  try {
    const files = await File.find({ owner: req.user.id })
      .select("-encryptedPath -shareToken -s3Key")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: " Files fetched!",
      count: files.length,
      files,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching files", error: error.message });
  }
};

//  DOWNLOAD FILE
const downloadFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    const ip = req.ip || req.connection.remoteAddress;

    if (!file) {
      return res.status(404).json({ message: "File not found!" });
    }

    let fileBuffer;

    // Download from S3 or local
    if (file.storageType === "s3" && file.s3Key) {
      fileBuffer = await downloadAndDecryptFromS3(file.s3Key);
    } else if (file.encryptedPath) {
      const { decryptFile } = require("../utils/encryption");
      fileBuffer = decryptFile(file.encryptedPath);
    } else {
      return res.status(404).json({ message: "File not found in storage!" });
    }

    // Log action
    await createLog({
      user: req.user.id,
      action: "FILE_DOWNLOAD",
      description: `File downloaded from S3: ${file.originalName}`,
      ipAddress: ip,
      userAgent: req.headers["user-agent"],
      status: "SUCCESS",
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${file.originalName}"`,
    );
    res.setHeader("Content-Type", file.mimetype);
    res.send(fileBuffer);
  } catch (error) {
    res.status(500).json({ message: "Download failed!", error: error.message });
  }
};

//  DELETE FILE
const deleteFile = async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.id,
      owner: req.user.id,
    });

    const ip = req.ip || req.connection.remoteAddress;

    if (!file) {
      return res.status(404).json({ message: "File not found!" });
    }

    // Delete from S3 or local
    if (file.storageType === "s3" && file.s3Key) {
      await deleteFromS3(file.s3Key);
    } else if (file.encryptedPath) {
      const fs = require("fs");
      if (fs.existsSync(file.encryptedPath)) {
        fs.unlinkSync(file.encryptedPath);
      }
    }

    // Update storage
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { storageUsed: -file.size },
    });

    // Log action
    await createLog({
      user: req.user.id,
      action: "FILE_DELETE",
      description: `File deleted from S3: ${file.originalName}`,
      ipAddress: ip,
      userAgent: req.headers["user-agent"],
      status: "SUCCESS",
    });

    await File.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: " File deleted from cloud successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Delete failed!", error: error.message });
  }
};

module.exports = { uploadFile, getMyFiles, downloadFile, deleteFile };
