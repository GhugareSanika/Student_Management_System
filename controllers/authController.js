import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { asyncHandler } from "../middleware/errorHandler.js";

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

export const register = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "User with this email or username already exists",
    });
  }

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    role: role || "admin",
  });

  // Generate token
  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email }).select("+password");

  if (!user || !user.isActive) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials",
    });
  }

  // Update last login
  await user.updateLastLogin();

  // Generate token
  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
      },
      token,
    },
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.status(200).json({
    success: true,
    data: {
      user,
    },
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { username, email } = req.body;

  const user = await User.findById(req.user._id);

  if (username) user.username = username;
  if (email) user.email = email;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: {
      user,
    },
  });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      success: false,
      message: "Current password is incorrect",
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    message: "Logout successful. Please remove the token from client storage.",
  });
});
