const userModel = require("../../Models/userModel.js");
const bcrypt = require("bcrypt");
const generateToken = require("../../Utils/tokenGenerator.js");
const { sendOtp, verifyOTP } = require("../../Service/otpgenerator.js");
const { client } = require("../../Config/redis.js");

require("dotenv").config();

const registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const isExist = await userModel.findOne({ email });

    if (isExist) {
      return res.status(409).json({ message: "User Already Exist" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await client.set(
      `register:${email}`,
      JSON.stringify({ name, email, password: hashedPassword }),
      { EX: 900 },
    );

    const result = await sendOtp(email);

    if (!result.success) {
      return res.status(400).json({ message: "Failed to send OTP" });
    }

    res.status(200).json({ message: "OTP send to email successfully" });
  } catch (e) {
    res.status(500).json({ message: "server error" });
  }
};

const resendOtpController = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "eamil is required" });
    }

    const result = await sendOtp(email);

    if (!result.success) {
      return res.status(400).json({ message: "Failed to resend OTP" });
    }
    res.status(200).json({ message: "OTP Send Successfully" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;
    console.log("userEmail:", email);
    console.log("userSendOtp:", otp);

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and Otp are required " });
    }

    const result = await verifyOTP(email, otp);

    if (!result.success) {
      if (result.message === "OTP expried") {
        return res.status(404).json({ message: "OTP expried" });
      }
      if (result.message === "Invalid OTP") {
        return res.status(401).json({ message: "Invalid OTP" });
      }

      return res.status(400).json({ message: "Verification failed" });
    }

    const userData = await client.get(`register:${email}`);

    if (!userData) {
      return res
        .status(400)
        .json({ message: "Registration session expired ,Reregister" });
    }

    const { name, password } = JSON.parse(userData);

    const newUser = await userModel.create({
      name,
      email,
      password,
    });

    await client.del(`register:${email}`);

    const { RefreshToken, AccessToken } = generateToken(
      newUser.email,
      newUser._id,
      newUser.role,
    );

    res
      .status(201)
      .cookie("Access_Token", AccessToken, {
        secure: true,
        sameSite: "none",
        httpOnly: true,
      })
      .cookie("Refresh_Token", RefreshToken, {
        secure: true,
        sameSite: "none",
        httpOnly: true,
      })
      .json({
        message: "User registered successfully",
        role: newUser.role,
        name: newUser.name,
        email: newUser.email,
      });
  } catch (e) {
    console.log("error occures", e.message);
    res.status(500).json({ message: "Server Error" });
  }
};

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const isUser = await userModel.findOne({ email }).select("+password");

    if (!isUser) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (isUser.isBlocked) {
      return res
        .status(403)
        .json({ message: "Access denied.Please try again later" });
    }

    const isvalid = await bcrypt.compare(password, isUser.password);

    if (!isvalid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const { RefreshToken, AccessToken } = generateToken(
      isUser.email,
      isUser._id,
      isUser.role,
    );

    return res
      .status(200)
      .cookie("Access_Token", AccessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .cookie("Refresh_Token", RefreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .json({
        message: "Login successful",
        role: isUser.role,
        name: isUser.name,
        email: isUser.email,
      });
  } catch (e) {
    console.error("LoginController error:", e.message);

    return res.status(e.status || 500).json({
      message: e.message,
    });
  }
};

const getLoginUser = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ Message: "Unauthorized" });
    }

    const userData = await userModel.findOne({ _id: req.user.userID });

    res.status(200).json({
      Message: "User found",
      UserData: userData,
    });
  } catch (e) {
    res.status(500).json({
      Message: "Error in GetLoginUser",
      Error: e.message,
    });
  }
};

const logoutController = async (req, res) => {
  try {
    res
      .clearCookie("Access_Token", {
        sameSite: "lax",
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .clearCookie("Refresh_Token", {
        sameSite: "lax",
        httpOnly: true,
        secure: true,
        sameSite: "none",
      })
      .status(200)
      .json({ Message: "Logout successful" });
  } catch (e) {
    res.status(500).json({ Message: "Logout error" });
  }
};

module.exports = {
  registerController,
  loginController,
  getLoginUser,
  logoutController,
  verifyOtpController,
  resendOtpController,
};
