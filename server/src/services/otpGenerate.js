

// In-memory OTP store (or replace with DB later)
const otpStore = {};  

// Generate 6-digit OTP
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
  if (!otpData) return false;
  if (otpData.expires < Date.now()) {
    delete otpStore[email];
    return false; // expired
  }
  if (otpData.code === code) {
    delete otpStore[email]; // OTP used
    return true;
  }
  return false;
}

module.exports = {
  generateOtp,
  saveOtp,
  verifyOtp,
};
