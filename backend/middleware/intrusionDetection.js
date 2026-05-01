const { createLog } = require("../utils/auditLogger");
const { sendSuspiciousActivityAlert } = require("../utils/emailService");

const failedAttempts = {};

const trackFailedLogin = async (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;

  if (!failedAttempts[ip]) {
    failedAttempts[ip] = { count: 0, firstAttempt: Date.now() };
  }

  const timeDiff = Date.now() - failedAttempts[ip].firstAttempt;
  if (timeDiff > 15 * 60 * 1000) {
    failedAttempts[ip] = { count: 0, firstAttempt: Date.now() };
  }

  failedAttempts[ip].count += 1;

  if (failedAttempts[ip].count >= 5) {
    await createLog({
      action: "SUSPICIOUS_ACTIVITY",
      description: `⚠️ ${failedAttempts[ip].count} failed login attempts from IP: ${ip}`,
      ipAddress: ip,
      userAgent: req.headers["user-agent"],
      status: "WARNING"
    });

    // Send email alert
    await sendSuspiciousActivityAlert({
      ipAddress: ip,
      attempts: failedAttempts[ip].count,
      userAgent: req.headers["user-agent"]
    });

    console.warn(`🚨 SUSPICIOUS ACTIVITY DETECTED from IP: ${ip}`);
  }

  next();
};

const resetFailedAttempts = (ip) => {
  if (failedAttempts[ip]) {
    delete failedAttempts[ip];
  }
};

const getFailedAttempts = () => failedAttempts;

module.exports = { trackFailedLogin, resetFailedAttempts, getFailedAttempts };