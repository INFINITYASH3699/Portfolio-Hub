const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // Built-in Node.js module for cryptography
const sendEmail = require('../utils/sendEmail'); // NEW
const PasswordResetToken = require('../models/PasswordResetToken'); // NEW

// Helper function to return user data (without password)
const getUserDataForResponse = async (userId) => {
  const user = await User.findById(userId).select('-password');
  // Ensure all fields are returned as per schema structure
  if (user) {
    return {
      _id: user._id,
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      profilePicture: user.profilePicture,
      bio: user.bio,
      phone: user.phone,
      location: user.location,
      website: user.website,
      socialLinks: user.socialLinks,
      professionalInfo: user.professionalInfo,
      subscription: user.subscription,
      preferences: user.preferences,
      isAdmin: user.isAdmin,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
  return null;
};


// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const userExists = await User.findOne({ $or: [{ email }, { username }] });

  if (userExists) {
    res.status(400);
    throw new Error('User with this email or username already exists');
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  if (user) {
    generateToken(res, user._id);
    const userData = await getUserDataForResponse(user._id); // Get full data
    res.status(201).json(userData); // Send full data
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/signin
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    generateToken(res, user._id);
    const userData = await getUserDataForResponse(user._id); // Get full data
    res.json(userData); // Send full data
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Logout user / clear cookies
// @route   POST /api/auth/logout
// @access  Private
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('accessToken', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.cookie('refreshToken', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });
  res.status(200).json({ message: 'Logged out successfully' });
});

// @desc    Refresh access token using refresh token
// @route   POST /api/auth/refresh
// @access  Public (but expects refresh token in cookie)
const refreshAccessToken = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    res.status(401);
    throw new Error('No refresh token provided');
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId); // Find user without selecting specific fields first

    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    generateToken(res, user._id);
    const userData = await getUserDataForResponse(user._id); // Get full data
    res.json(userData); // Send full data

  } catch (error) {
    console.error('Refresh token failed:', error.message);
    res.status(401);
    throw new Error('Not authorized, invalid refresh token');
  }
});

// @desc    Request password reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    res.status(400);
    throw new Error('Please provide an email address');
  }

  const user = await User.findOne({ email });

  if (!user) {
    // Return 200 OK even if user not found to prevent email enumeration
    return res.status(200).json({ message: 'If an account with that email exists, a password reset link has been sent.' });
  }

  // Generate a reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Store token in DB (or update if already exists)
  await PasswordResetToken.findOneAndUpdate(
    { userId: user._id },
    { userId: user._id, token: hashedToken, createdAt: Date.now() },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Create reset URL
  const resetUrl = `${process.env.CLIENT_URL}/auth/reset-password?token=${resetToken}`;

  const message = `
    <h1>You have requested a password reset</h1>
    <p>Please go to this link to reset your password:</p>
    <a href="${resetUrl}" clicktracking="off">${resetUrl}</a>
    <p>This link is valid for 1 hour.</p>
    <p>If you did not request this, please ignore this email.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: 'PortfolioHub Password Reset Request',
      message: message,
    });

    res.status(200).json({ message: 'Password reset link sent to your email.' });
  } catch (error) {
    console.error('Error sending reset email:', error);
    res.status(500);
    throw new Error('Email could not be sent. Please try again later.');
  }
});

// @desc    Reset user password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;

  if (!token || !password) {
    res.status(400);
    throw new Error('Token and new password are required');
  }

  // Hash the incoming token to compare with DB
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const resetTokenEntry = await PasswordResetToken.findOne({ token: hashedToken });

  if (!resetTokenEntry) {
    res.status(400);
    throw new Error('Invalid or expired password reset token');
  }

  const user = await User.findById(resetTokenEntry.userId);

  if (!user) {
    res.status(404);
    throw new Error('User not found for this token');
  }

  // Update user's password
  user.password = password; // Mongoose pre-save hook for User model will hash this
  await user.save();

  // Delete the reset token from DB
  await PasswordResetToken.deleteOne({ _id: resetTokenEntry._id });

  res.status(200).json({ message: 'Password has been reset successfully. You can now log in.' });
});


module.exports = {
  registerUser,
  authUser,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
};