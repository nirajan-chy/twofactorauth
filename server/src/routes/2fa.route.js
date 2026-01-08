// routes/2fa.routes.js
const express = require("express");
const twoFARouter = express.Router();
const { setup2fa, verify2fa } = require("../controllers/2fa.controller");

// GET /2fa/setup/:id -> return QR + secret
twoFARouter.get("/setup/:id", setup2fa);

// POST /2fa/verify/:id -> verify token and enable 2FA
twoFARouter.post("/verify/:id", verify2fa);

module.exports = twoFARouter;
