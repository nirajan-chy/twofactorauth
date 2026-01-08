const { Router } = require("express");
const validate = require("../middlewares/validate");
const {
  userRegister,
  verifyEmail,
  login,
  verifyOtp,
  forgetPassword,
  resetPassword,
  deleteUser,
} = require("../controllers/user.controller");
const userValidator = require("../validators/user.validator");

const userRouter = Router();
userRouter.post("/register", validate(userValidator), userRegister);
userRouter.get("/verify/:token", verifyEmail);
userRouter.post("/login", login);
userRouter.post("/verify-otp", verifyOtp);
userRouter.post("/forgetPassword", forgetPassword);
userRouter.post("/resetPassword", resetPassword);
userRouter.delete("/delete/:id", deleteUser);

module.exports = userRouter;
