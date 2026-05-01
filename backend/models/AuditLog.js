const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  action: {
    type: String,
    required: true,
    enum: [
      "REGISTER",
      "LOGIN",
      "LOGIN_FAILED",
      "LOGOUT",
      "FILE_UPLOAD",
      "FILE_DOWNLOAD",
      "FILE_DELETE",
      "SHARE_GENERATED",
      "SHARE_ACCESSED",
      "SHARE_REVOKED",
      "SUSPICIOUS_ACTIVITY"
    ]
  },
  description: {
    type: String,
    required: true
  },
  ipAddress: {
    type: String,
    default: "unknown"
  },
  userAgent: {
    type: String,
    default: "unknown"
  },
  status: {
    type: String,
    enum: ["SUCCESS", "FAILED", "WARNING"],
    default: "SUCCESS"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);