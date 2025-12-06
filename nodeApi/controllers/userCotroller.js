import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import User from '../models/userModel.js';
import { sendOtpEmail } from '../utils/emailService.js';

export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }

  console.log('Registration attempt:', { username, email });

  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error("User already registered with this email");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  try {
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
    });
    
    if (user) {
      res.status(201).json({
        _id: user.id,
        email: user.email,
        message: "User registered successfully"
      });
    } else {
      res.status(400);
      throw new Error("Invalid user data");
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400);
    throw new Error(error.message || "Failed to create user");
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory");
  }
  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    throw new Error("User not Found");
  }

  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign({
      user: {
        username: user.username,
        email: user.email,
        id: user.id,
      }
    }, process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error("Email or password is incorrect");
  }
});

export const currentUser = asyncHandler(async (req, res) => {
  const { id, email, username } = req.user;
  let user = await User.findOne({ _id: id });
  res.json(user);
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    res.status(400);
    throw new Error("Email is required");
  }

  const user = await User.findOne({ email });
  if (!user) {
    res.status(404);
    throw new Error("User with this email does not exist");
  }

  // Generate a random 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiry = new Date();
  otpExpiry.setMinutes(otpExpiry.getMinutes() + 10); // OTP valid for 10 minutes

  try {
    // Save OTP to user record
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = otpExpiry;
    await user.save();

    // Send OTP via email
    await sendOtpEmail(email, otp);

    res.status(200).json({ 
      message: "Password reset OTP has been sent to your email",
      otp: otp // For development only, remove in production
    });
  } catch (error) {
    res.status(500);
    throw new Error("Failed to send OTP email. Please try again later.");
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  
  if (!email || !otp || !newPassword) {
    res.status(400);
    throw new Error("All fields are required");
  }

  const user = await User.findOne({ 
    email,
    resetPasswordOtp: otp,
    resetPasswordExpires: { $gt: new Date() }
  });

  if (!user) {
    res.status(400);
    throw new Error("Invalid or expired OTP");
  }

  // Hash the new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  // Update user's password and clear reset fields
  user.password = hashedPassword;
  user.resetPasswordOtp = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({ message: "Password has been reset successfully" });
});