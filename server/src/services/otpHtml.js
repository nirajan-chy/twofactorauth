function getOtpHtml({ email, otp }) {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Your OTP Code</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f4;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 500px;
        margin: 50px auto;
        background-color: #ffffff;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        text-align: center;
      }
      h1 {
        color: #333333;
      }
      p {
        color: #555555;
        font-size: 16px;
      }
      .otp {
        display: inline-block;
        background-color: #f0f0f0;
        color: #111827;
        font-size: 28px;
        font-weight: bold;
        letter-spacing: 4px;
        padding: 15px 25px;
        border-radius: 6px;
        margin: 20px 0;
      }
      .note {
        font-size: 14px;
        color: #888888;
        margin-top: 15px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Hello ${email}</h1>
      <p>Thanks for registering. Use the OTP below to verify your email. It is valid for 5 minutes.</p>
      <div class="otp">${otp}</div>
      <p class="note">If you did not request this, please ignore this email.</p>
    </div>
  </body>
  </html>
  `;
}

module.exports = getOtpHtml;
