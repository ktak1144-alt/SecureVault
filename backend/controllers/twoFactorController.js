const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const User = require("../models/User");
const { createLog } = require("../utils/auditLogger");

// ✅ SETUP 2FA — Generate QR Code
const setup2FA = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `SecureVault (${user.email})`,
      issuer: "SecureVault"
    });

    // Save secret temporarily
    user.twoFactorSecret = secret.base32;
    await user.save();

    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

    res.status(200).json({
      message: "✅ 2FA Setup initiated!",
      qrCode: qrCodeUrl,
      secret: secret.base32,
      instructions: "Scan this QR code with Google Authenticator app"
    });

  } catch (error) {
    res.status(500).json({ message: "2FA setup failed!", error: error.message });
  }
};

// ✅ VERIFY & ENABLE 2FA
const verify2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    const user = await User.findById(req.user.id);

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: "2FA not set up!" });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ message: "❌ Invalid 2FA code!" });
    }

    // Enable 2FA
    user.twoFactorEnabled = true;
    await user.save();

    await createLog({
      user: user._id,
      action: "LOGIN",
      description: `2FA enabled for: ${user.email}`,
      ipAddress: ip,
      userAgent: req.headers["user-agent"],
      status: "SUCCESS"
    });

    res.status(200).json({
      message: "✅ 2FA enabled successfully!",
      twoFactorEnabled: true
    });

  } catch (error) {
    res.status(500).json({ message: "2FA verification failed!", error: error.message });
  }
};

// ✅ VALIDATE 2FA during login
const validate2FA = async (req, res) => {
  try {
    const { email, token } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (!user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA not enabled!" });
    }

    // Verify token
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 2
    });

    if (!verified) {
      await createLog({
        user: user._id,
        action: "LOGIN_FAILED",
        description: `Invalid 2FA code for: ${email}`,
        ipAddress: ip,
        userAgent: req.headers["user-agent"],
        status: "FAILED"
      });
      return res.status(400).json({ message: "❌ Invalid 2FA code!" });
    }

    await createLog({
      user: user._id,
      action: "LOGIN",
      description: `2FA validated for: ${email}`,
      ipAddress: ip,
      userAgent: req.headers["user-agent"],
      status: "SUCCESS"
    });

    res.status(200).json({
      message: "✅ 2FA validated successfully!",
      verified: true
    });

  } catch (error) {
    res.status(500).json({ message: "2FA validation failed!", error: error.message });
  }
};

// ✅ DISABLE 2FA
const disable2FA = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || !user.twoFactorEnabled) {
      return res.status(400).json({ message: "2FA is not enabled!" });
    }

    // Verify token before disabling
    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 2
    });

    if (!verified) {
      return res.status(400).json({ message: "❌ Invalid 2FA code!" });
    }

    // Disable 2FA
    user.twoFactorEnabled = false;
    user.twoFactorSecret = null;
    await user.save();

    res.status(200).json({ message: "✅ 2FA disabled successfully!" });

  } catch (error) {
    res.status(500).json({ message: "Disable 2FA failed!", error: error.message });
  }
};

// ✅ GET 2FA STATUS
const get2FAStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      twoFactorEnabled: user.twoFactorEnabled
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching 2FA status" });
  }
};

module.exports = { setup2FA, verify2FA, validate2FA, disable2FA, get2FAStatus };