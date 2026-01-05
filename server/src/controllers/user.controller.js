const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models/user.model");
const { secret_key, client_url } = require("../../api/env");
const tryCatch = require("../middlewares/tryCatch");
const sendEmail = require("../services/sendEmail");
const { JSON } = require("sequelize");
const getOtpHtml = require("../services/otpHtml");
const { generateOtp, saveOtp } = require("../services/otpGenerate");

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




exports.login = tryCatch(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  // Find user
  const user = await User.findOne({ where: { email } });
  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Check if email is verified
  if (!user.isVerified) {
    return res.status(400).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Generate OTP
  const otp = generateOtp();
  saveOtp(user.email, otp);

  // Send OTP email
  const html = getOtpHtml({ email: user.email, otp });

  try {
    await sendEmail({
      email: user.email,
      subject: "OTP for verification",
      html,
    });
    console.log("OTP sent to:", user.email);
  } catch (err) {
    console.error("Error sending OTP email:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP email",
    });
  }

  res.json({
    success: true,
    message: "OTP sent. It is valid for 5 minutes.",
  });
});