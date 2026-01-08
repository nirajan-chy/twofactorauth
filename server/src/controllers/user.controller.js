const bcrypt = require("bcrypt");
const crypto = require("crypto");
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const { secret_key, refresh_key, client_url } = require("../../api/env");
const tryCatch = require("../middlewares/tryCatch");
const sendEmail = require("../services/sendEmail");
const { JSON } = require("sequelize");
const getOtpHtml = require("../services/otpHtml");
const { generateOtp, saveOtp, verifyOtp } = require("../services/otpGenerate");
const generateToken = require("../services/generateToken");
const { User } = require("../models/user.model");

exports.userRegister = tryCatch(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email, and password are required",
    });
  }

  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res
      .status(400)
      .json({ success: false, message: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    isVerified: false,
  });

  const token = jwt.sign({ id: newUser.id }, secret_key, { expiresIn: "1d" });
  const verificationLink = `http://localhost:3000/verify-email/${encodeURIComponent(
    token
  )}`;

  const html = `
    <h1>Hello ${name}</h1>
    <p>Thanks for registering. Please verify your email by clicking below:</p>
    <a href="${verificationLink}">Verify Email</a>
  `;

  try {
    await sendEmail({ to: email, subject: "Verify your email", html });
  } catch (err) {
    console.error("Email sending failed:", err);
  }

  res.status(201).json({
    success: true,
    message: "User registered successfully. Verification email sent.",
    user: newUser,
  });
});

exports.verifyEmail = tryCatch(async (req, res) => {
  const { token } = req.params;
  console.log("Token:", token);

  if (!token)
    return res.status(400).json({ success: false, message: "Token missing" });

  let decoded;
  try {
    decoded = jwt.verify(decodeURIComponent(token), secret_key);
    console.log("Decoded token:", decoded);
  } catch (err) {
    console.error(err);
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }

  const user = await User.findByPk(decoded.id);
  if (!user)
    return res.status(400).json({ success: false, message: "Invalid token" });

  user.isVerified = true;
  await user.save();
  console.log("User verified in DB:", user);

  res.status(200).json({
    message: "User verified successfully",
  });
});

exports.login = tryCatch(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  if (!user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Please verify your email first",
    });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid password",
    });
  }

  const otp = generateOtp();
  // console.log(otp);
  saveOtp(email, otp);

  await sendEmail({
    to: email,
    subject: "Your Login OTP",
    html: getOtpHtml({ email, otp }),
  });

  res.status(200).json({
    success: true,
    message: "OTP sent to your email",
    response: email,
  });
});

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("OTP:", otp);

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP required",
      });
    }

    const isValid = verifyOtp(email, otp);
    console.log("OTP Valid:", isValid);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const tokens = generateToken(user.id);
    console.log(tokens);

    return res.status(200).json({
      success: true,
      message: "OTP verified and token generated ",
      ...tokens,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // ✅ SAVE OTP IN USER TABLE
    user.resetOtp = hashedOtp;
    user.resetOtpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    await sendEmail({
      to: email,
      subject: "Your Password Reset OTP",
      html: getOtpHtml({ email, otp }),
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, enterOtp, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.resetOtp || Date.now() > user.resetOtpExpiry) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isValid = await bcrypt.compare(enterOtp, user.resetOtp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user)
      return res.status(400).json({
        message: "user not found" + error.message,
      });

    await user.destroy();
    res.status(200).json({
      message: "User deleted",
      user: user,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
