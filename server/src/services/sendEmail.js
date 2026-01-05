const nodemailer = require("nodemailer");
const { email, password } = require("../../api/env");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: email,
    pass: password,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"Authentication" <${email}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
