const express=require("express");
const route=express.Router();
const {validate}=require("../Middleware/validate");
const loginValidate=require("../Validator/loginValidate");
const registervalidate=require("../Validator/registervalidate");
const {registerController,loginController,getLoginUser,logoutController,verifyOtpController,resendOtpController}=require("../Controller/user/authcontroller");
const protectRoutes=require("../Middleware/protectRouter")
const tokenRegenerator=require("../Service/tokenRegenerate");
const verifyOtpValidate=require("../Validator/otpvalidate");
const { authLimiter, otpLimiter}=require("../Middleware/rateLimiter")




route.post("/register",authLimiter,validate(registervalidate),registerController);
route.post("/verify-otp",authLimiter,validate(verifyOtpValidate),verifyOtpController);
route.post("/resend-otp",otpLimiter,resendOtpController)
route.post("/login",authLimiter,validate(loginValidate),loginController);
route.post("/logout",protectRoutes,logoutController);
route.post("/refresh",tokenRegenerator);
route.get("/getUser",protectRoutes,getLoginUser);




module.exports=route;