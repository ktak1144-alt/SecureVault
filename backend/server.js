const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const fileRoutes = require("./routes/fileRoutes");
const shareRoutes = require("./routes/shareRoutes");
const adminRoutes = require("./routes/adminRoutes");
const twoFactorRoutes = require("./routes/twoFactorRoutes");
const { generalLimiter, authLimiter } = require("./middleware/rateLimiter");
const { trackFailedLogin } = require("./middleware/intrusionDetection");

dotenv.config();
connectDB();

const app = express();

app.use(helmet());
app.use(morgan("dev"));
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://secure-vault-66m9.vercel.app"
  ],
  credentials: true
}));
app.use(express.json());

app.use("/api/", generalLimiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/login", trackFailedLogin);

app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/share", shareRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/2fa", twoFactorRoutes);

app.get("/", (req, res) => {
  res.json({ message: "SecureVault Backend is Running! 🔐" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});