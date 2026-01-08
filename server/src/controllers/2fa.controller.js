// controllers/2fa.controller.js
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const { User } = require("../models/user.model");

// Generate QR + secret
exports.setup2fa = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id); // get user by id
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `SecureVault (${user.email})`,
      length: 20,
    });

    // Save secret in DB
    user.twoFactorSecret = secret.base32;
    user.twoFactorEnabled = false;
    await user.save();

    // Generate QR code URL
    const qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);

    res.json({
      success: true,
      qrCode: qrCodeDataURL,
      manualCode: secret.base32,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Verify token and enable 2FA
exports.verify2fa = async (req, res) => {
  try {
    const { token } = req.body;
    const user = await User.findByPk(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1, // 30s drift allowed
    });

    if (!isValid)
      return res.status(400).json({ success: false, message: "Invalid token" });

    user.twoFactorEnabled = true;
    await user.save();

    res.json({ success: true, message: "Two-Factor Authentication enabled!" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
