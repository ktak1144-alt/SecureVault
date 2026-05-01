const nodemailer = require("nodemailer");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// ✅ Send Suspicious Activity Alert
const sendSuspiciousActivityAlert = async ({ ipAddress, attempts, userAgent }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SecureVault Security" <${process.env.EMAIL_USER}>`,
      to: process.env.ALERT_EMAIL,
      subject: "🚨 SecureVault — Suspicious Activity Detected!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 30px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #ff4444; font-size: 28px;">🚨 Security Alert</h1>
            <p style="color: #aaaaaa;">SecureVault has detected suspicious activity</p>
          </div>
          
          <div style="background: #16213e; padding: 20px; border-radius: 8px; border-left: 4px solid #ff4444; margin-bottom: 20px;">
            <h2 style="color: #ff4444; margin-top: 0;">⚠️ Multiple Failed Login Attempts</h2>
            <table style="width: 100%; color: #cccccc;">
              <tr>
                <td style="padding: 8px 0;"><strong>IP Address:</strong></td>
                <td style="color: #ff6666;">${ipAddress}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Failed Attempts:</strong></td>
                <td style="color: #ff6666;">${attempts}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Time:</strong></td>
                <td>${new Date().toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Device:</strong></td>
                <td style="font-size: 12px;">${userAgent}</td>
              </tr>
            </table>
          </div>

          <div style="background: #0f3460; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #aaaaaa; font-size: 14px;">
              💡 <strong>Recommended Action:</strong> If this wasn't you, consider changing your password immediately and blocking this IP address.
            </p>
          </div>

          <div style="text-align: center; color: #666666; font-size: 12px;">
            <p>This is an automated alert from SecureVault Security System</p>
            <p>🔐 Keeping your files safe</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Suspicious activity alert email sent!");

  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
};

// ✅ Send Login Notification
const sendLoginNotification = async ({ name, email, ipAddress, userAgent }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SecureVault Security" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "✅ SecureVault — New Login Detected",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 30px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #4CAF50; font-size: 28px;">🔐 SecureVault</h1>
            <p style="color: #aaaaaa;">New login to your account</p>
          </div>

          <div style="background: #16213e; padding: 20px; border-radius: 8px; border-left: 4px solid #4CAF50; margin-bottom: 20px;">
            <h2 style="color: #4CAF50; margin-top: 0;">✅ Successful Login</h2>
            <p style="color: #cccccc;">Hi <strong>${name}</strong>, a new login was detected on your account.</p>
            <table style="width: 100%; color: #cccccc;">
              <tr>
                <td style="padding: 8px 0;"><strong>Time:</strong></td>
                <td>${new Date().toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>IP Address:</strong></td>
                <td>${ipAddress}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Device:</strong></td>
                <td style="font-size: 12px;">${userAgent}</td>
              </tr>
            </table>
          </div>

          <div style="background: #0f3460; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #aaaaaa; font-size: 14px;">
              💡 If this wasn't you, please change your password immediately!
            </p>
          </div>

          <div style="text-align: center; color: #666666; font-size: 12px;">
            <p>This is an automated alert from SecureVault Security System</p>
            <p>🔐 Keeping your files safe</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Login notification email sent!");

  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
};

// ✅ Send File Share Notification
const sendShareNotification = async ({ ownerName, fileName, shareLink, expiresAt }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"SecureVault" <${process.env.EMAIL_USER}>`,
      to: process.env.ALERT_EMAIL,
      subject: "📁 SecureVault — File Shared Successfully",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a1a2e; color: #ffffff; padding: 30px; border-radius: 10px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2196F3; font-size: 28px;">🔐 SecureVault</h1>
            <p style="color: #aaaaaa;">File shared successfully</p>
          </div>

          <div style="background: #16213e; padding: 20px; border-radius: 8px; border-left: 4px solid #2196F3; margin-bottom: 20px;">
            <h2 style="color: #2196F3; margin-top: 0;">📁 File Shared</h2>
            <table style="width: 100%; color: #cccccc;">
              <tr>
                <td style="padding: 8px 0;"><strong>Shared By:</strong></td>
                <td>${ownerName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>File Name:</strong></td>
                <td>${fileName}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Expires At:</strong></td>
                <td>${new Date(expiresAt).toLocaleString("en-IN")}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Share Link:</strong></td>
                <td style="word-break: break-all; color: #64b5f6;">${shareLink}</td>
              </tr>
            </table>
          </div>

          <div style="text-align: center; color: #666666; font-size: 12px;">
            <p>This is an automated notification from SecureVault</p>
            <p>🔐 Keeping your files safe</p>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Share notification email sent!");

  } catch (error) {
    console.error("❌ Email error:", error.message);
  }
};

module.exports = {
  sendSuspiciousActivityAlert,
  sendLoginNotification,
  sendShareNotification
};