const jwt = require("jsonwebtoken");
const { secret_key, refresh_key } = require("../../api/env");
const { User } = require("../models/user.model");

const generateToken = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(email);

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const accessToken = jwt.sign({ id: user.id }, secret_key, {
      expiresIn: "2m",
    });
    const refreshToken = jwt.sign({ id: user.id }, refresh_key, {
      expiresIn: "7d",
    });

    // 3️ Send tokens in response
    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = generateToken;
