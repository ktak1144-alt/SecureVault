const AuditLog = require("../models/AuditLog");

const createLog = async ({ user, action, description, ipAddress, userAgent, status }) => {
  try {
    const log = new AuditLog({
      user: user || null,
      action,
      description,
      ipAddress: ipAddress || "unknown",
      userAgent: userAgent || "unknown",
      status: status || "SUCCESS"
    });
    await log.save();
  } catch (error) {
    console.error("❌ Audit log error:", error.message);
  }
};

module.exports = { createLog };