// services/otpService.js
const otpStore = {};  

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Save OTP
function saveOtp(email, code) {
  otpStore[email] = {
    code,
    expires: Date.now() + 5 * 60 * 1000, // 5 minutes
  };
}

// Verify OTP
function verifyOtp(email, code) {
  const otpData = otpStore[email];
  if (!otpData) return false;          // OTP not found
  if (otpData.expires < Date.now()) {  // OTP expired
    delete otpStore[email];
    return false;
  }
  if (otpData.code === code) {
    delete otpStore[email];             // OTP used
    return true;
  }
  return false;                         // OTP mismatch
}

module.exports = {
  generateOtp,
  saveOtp,
  verifyOtp,
};
