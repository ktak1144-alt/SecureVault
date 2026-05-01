const jwt = require("jsonwebtoken");

// ✅ Protect — Any logged in user
const protect = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "❌ No token, access denied!" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: "❌ Invalid token!" });
  }
};

// ✅ Admin Only — Restrict to admin role
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ 
      message: "❌ Access denied! Admins only." 
    });
  }
  next();
};

module.exports = { protect, adminOnly };