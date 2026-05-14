const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createLog } = require("../utils/auditLogger");
const { resetFailedAttempts } = require("../middleware/intrusionDetection");
const { sendLoginNotification } = require("../utils/emailService");

//  REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered!" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Log registration
    await createLog({
      user: user._id,
      action: "REGISTER",
      description: `New user registered: ${email}`,
      ipAddress: ip,
      userAgent: req.headers["user-agent"],
      status: "SUCCESS"
    });

    res.status(201).json({
      message: " Registration successful!",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;

    const user = await User.findOne({ email });
    if (!user) {
      await createLog({
        action: "LOGIN_FAILED",
        description: `Failed login attempt for email: ${email}`,
        ipAddress: ip,
        userAgent: req.headers["user-agent"],
        status: "FAILED"
      });
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      await createLog({
        user: user._id,
        action: "LOGIN_FAILED",
        description: `Wrong password for: ${email}`,
        ipAddress: ip,
        userAgent: req.headers["user-agent"],
        status: "FAILED"
      });
      return res.status(400).json({ message: "Invalid email or password!" });
    }

    // Reset failed attempts on successful login
    resetFailedAttempts(ip);

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

  // Log successful login
await createLog({
  user: user._id,
  action: "LOGIN",
  description: `User logged in: ${email}`,
  ipAddress: ip,
  userAgent: req.headers["user-agent"],
  status: "SUCCESS"
});

// Send login notification email (non-blocking)
sendLoginNotification({
  name: user.name,
  email: user.email,
  ipAddress: ip,
  userAgent: req.headers["user-agent"]
}).catch(err => console.error("Email error:", err.message));

    res.status(200).json({
      message: " Login successful!",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { register, login };