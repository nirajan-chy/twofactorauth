const { Router } = require("express");
const validate = require("../middlewares/validate");
const {
  userRegister,
  verifyEmail,
  login,
} = require("../controllers/user.controller");
const userValidator = require("../validators/user.validator");

const userRouter = Router();
userRouter.post("/register", validate(userValidator), userRegister);
userRouter.post("/verify/:token", verifyEmail);
userRouter.post("/login", login);

module.exports = userRouter;
