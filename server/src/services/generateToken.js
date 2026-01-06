const jwt = require("jsonwebtoken");
const { secret_key, refresh_key } = require("../../api/env");

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    secret_key,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    refresh_key,
    { expiresIn: "7d" }
  );

  return {
    accessToken,
    refreshToken,
  };
};

module.exports = generateTokens;
