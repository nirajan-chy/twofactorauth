// const { secret_key } = require("../../api/env");
// const { User } = require("../models/user.model");
// const jwt = require("jsonwebtoken")

// exports.verifyEmail = tryCatch(async (req, res) => {
//   const { token } = req.params;

//   if (!token) {
//     return res.status(400).json({
//       success: false,
//       message: "Token missing",
//     });
//   }

//   let decoded;
//   try {
//     decoded = jwt.verify(decodeURIComponent(token), secret_key);
//   } catch (err) {
//     return res.status(401).json({
//       success: false,
//       message: "Invalid or expired token",
//     });
//   }

//   const user = await User.findByPk(decoded.id);

//   if (!user) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid token",
//     });
//   }

//   user.isVerified = true;
//   await user.save();

//   res.status(200).json({
//     success: true,
//     message: "Email verified successfully",
//   });
// });
