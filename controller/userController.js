const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const { getAccessToken, getRefreshToken } = require("../helper/token");

/* REGISTER NEW USER START HERE */

const registerUser = async (req, res) => {
  try {
    const { fullName, email, password, confirmPassword, studentId, role } =
      req.body;

    if (!fullName || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, password, and confirmPassword are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Password and confirmPassword do not match",
      });
    }

    if (role === "student" && !studentId) {
      return res.status(400).json({
        success: false,
        message: "Student ID is required for students",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      email,
      password: hashPassword,
      studentId: role === "student" ? studentId : null,
      role: role || "student",
    });

    return res.status(201).json({
      success: true,
      message: "User account created successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        studentId: user.studentId,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/* LOGIN USER START HERE */

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "all field is required",
        doc: "email or password is missing or not spelt well chekc it if u see this error",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "user do not exist",
        doc: "user do not have an account make sure user is registered first",
      });
    }

    const hashPasswordCheck = await bcrypt.compare(password, user.password);

    if (!hashPasswordCheck) {
      return res.status(400).json({
        success: false,
        message: "invalid credentail wrong email or password",
        doc: "when password do not match match the passowrd stored in the database(registered with password)",
      });
    }

    const userId = user._id;

    const accessToken = getAccessToken(userId);
    const refreshToken = getRefreshToken(userId);

    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 15, // 15 minutes
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      })
      .status(200)
      .json({
        message: "Logged in successfully",
        doc: "access and refreshToken is sent after user logins resend it back on every request.accesstoken is valid for 15mins",
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/* LOGOUT USER START HERE */
const logoutUser = (req, res) => {
  try {
    res
      .clearCookie("accessToken", {
        httpOnly: true,
        sameSite: "strict",
      })
      .clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "strict",
      })
      .status(200)
      .json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message || "Server error",
    });
  }
};

/* REFRESH TOKEN START HERE */

const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token provided" });
    }

    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err) {
          return res
            .status(403)
            .json({ message: "Invalid or expired refresh token" });
        }

        // Generate new access token
        const newAccessToken = getAccessToken(decoded.id);

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          sameSite: "strict",
          maxAge: 1000 * 60 * 15, // 15 minutes
        });

        res.status(200).json({ message: "Access token refreshed" });
      }
    );
  } catch (error) {
    return res.status(500).json({ message: error.message || "Server error" });
  }
};

module.exports = { registerUser, loginUser, refreshAccessToken, logoutUser };
