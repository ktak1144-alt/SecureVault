const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const AuditLog = require("../models/AuditLog");
const File = require("../models/File");
const User = require("../models/User");
const { getFailedAttempts } = require("../middleware/intrusionDetection");

//  GET DASHBOARD STATS
router.get("/stats", protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFiles = await File.countDocuments();
    const totalLogs = await AuditLog.countDocuments();

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayUploads = await AuditLog.countDocuments({
      action: "FILE_UPLOAD",
      createdAt: { $gte: today }
    });

    const todayDownloads = await AuditLog.countDocuments({
      action: "FILE_DOWNLOAD",
      createdAt: { $gte: today }
    });

    const todayLogins = await AuditLog.countDocuments({
      action: "LOGIN",
      createdAt: { $gte: today }
    });

    const failedLogins = await AuditLog.countDocuments({
      action: "LOGIN_FAILED",
      createdAt: { $gte: today }
    });

    const suspiciousActivity = await AuditLog.countDocuments({
      action: "SUSPICIOUS_ACTIVITY"
    });

    // Failed attempts per IP
    const failedAttempts = getFailedAttempts();
    const suspiciousIPs = Object.entries(failedAttempts)
      .filter(([ip, data]) => data.count >= 3)
      .map(([ip, data]) => ({ ip, attempts: data.count }));

    res.status(200).json({
      message: " Stats fetched!",
      stats: {
        totalUsers,
        totalFiles,
        totalLogs,
        todayUploads,
        todayDownloads,
        todayLogins,
        failedLogins,
        suspiciousActivity,
        suspiciousIPs
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
});

//  GET AUDIT LOGS
router.get("/logs", protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = req.query.filter || "ALL";

    let query = {};
    if (filter !== "ALL") {
      query.action = filter;
    }

    const logs = await AuditLog.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      message: "✅ Logs fetched!",
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching logs", error: error.message });
  }
});

// ✅ USER SECURITY — Own logs only
router.get("/my-stats", protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const myUploads = await AuditLog.countDocuments({
      user: req.user.id,
      action: "FILE_UPLOAD",
      createdAt: { $gte: today }
    });

    const myDownloads = await AuditLog.countDocuments({
      user: req.user.id,
      action: "FILE_DOWNLOAD",
      createdAt: { $gte: today }
    });

    const myLogins = await AuditLog.countDocuments({
      user: req.user.id,
      action: "LOGIN",
      createdAt: { $gte: today }
    });

    const myFailedLogins = await AuditLog.countDocuments({
      user: req.user.id,
      action: "LOGIN_FAILED",
      createdAt: { $gte: today }
    });

    const myTotalLogs = await AuditLog.countDocuments({
      user: req.user.id
    });

    const myFiles = await File.countDocuments({
      owner: req.user.id
    });

    res.status(200).json({
      message: "✅ My stats fetched!",
      stats: {
        myFiles,
        myTotalLogs,
        todayUploads: myUploads,
        todayDownloads: myDownloads,
        todayLogins: myLogins,
        failedLogins: myFailedLogins
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching stats", error: error.message });
  }
});

// ✅ USER LOGS — Own logs only
router.get("/my-logs", protect, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const filter = req.query.filter || "ALL";

    let query = { user: req.user.id };
    if (filter !== "ALL") {
      query.action = filter;
    }

    const logs = await AuditLog.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await AuditLog.countDocuments(query);

    res.status(200).json({
      message: "✅ My logs fetched!",
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    res.status(500).json({ message: "Error fetching logs", error: error.message });
  }
});

module.exports = router;