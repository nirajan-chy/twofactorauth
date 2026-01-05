const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { secret_key } = require("../../api/env");
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
    return res.status(400).json({
      success: false,
      message: "Email already exists",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const token = jwt.sign({ id: newUser.id }, secret_key, { expiresIn: "1d" });
  const verificationLink = `http://localhost:3000/verify/${encodeURIComponent(
    token
  )}`;

  const html = `
    <h1>Hello ${name}</h1>
    <p>Thanks for registering. Please verify your email by clicking below:</p>
    <a href="${verificationLink}">Verify Email</a>
    <p>${token}</p>
  `;

  await sendEmail({
    to: email,
    subject: "Verify your email",
    html,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully. Verification email sent.",
    user: newUser,
  });
});

exports.verifyEmail = tryCatch(async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token missing",
    });
  }

  let decoded;
  try {
    decoded = jwt.verify(decodeURIComponent(token), secret_key);
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  const user = await User.findByPk(decoded.id);

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "Invalid token",
    });
  }

  user.isVerified = true;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Email verified successfully",
  });
});

exports.login = async (req, res) => {
  try {
    const { email, password, otp } = req.body;

    console.log(email);

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ where: { email: email } });

    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (!otp || !verifyOtp(email, otp)) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    const accessToken = jwt.sign({ id: user.id }, secret_key, {
      expiresIn: "2m",
    });
    const refreshToken = jwt.sign({ id: user.id }, refresh_key, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP required" });
    }

    const isValid = verifyOtp(req, email, otp);
    console.log(isValid);

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const tokens = generateToken(user.id);

    return res.status(200).json({
      success: true,
      message: "OTP verified and token generated ✅",
      ...tokens,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};