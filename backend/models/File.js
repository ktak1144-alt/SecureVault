const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  // Local storage path (fallback)
  encryptedPath: {
    type: String,
    default: null
  },
  // S3 storage key
  s3Key: {
    type: String,
    default: null
  },
  // Storage type
  storageType: {
    type: String,
    enum: ["local", "s3"],
    default: "s3"
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  shareToken: {
    type: String,
    default: null
  },
  shareExpiry: {
    type: Date,
    default: null
  },
  shareAccessLimit: {
    type: Number,
    default: null
  },
  shareAccessCount: {
    type: Number,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  // AI Categorization
  aiCategory: {
    type: String,
    enum: [
      "Document",
      "Image",
      "Report",
      "Sensitive",
      "Notes",
      "Spreadsheet",
      "Presentation",
      "Other"
    ],
    default: "Other"
  },
  aiDescription: {
    type: String,
    default: null
  },
  aiTags: {
    type: [String],
    default: []
  },
  aiCategorizedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("File", fileSchema);