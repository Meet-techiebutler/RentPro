const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = signToken(user._id);
  user.password = undefined;
  res.status(statusCode).json(
    new ApiResponse(statusCode, { token, user }, message)
  );
};

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password.');
  }
  if (!user.isActive) throw new ApiError(403, 'Your account has been deactivated. Contact admin.');

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Login successful');
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json(new ApiResponse(200, { user }, 'Profile fetched'));
});

// PATCH /api/auth/update-profile
const updateProfile = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'phone', 'whatsapp'];
  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });
  res.status(200).json(new ApiResponse(200, { user }, 'Profile updated'));
});

// PATCH /api/auth/change-password
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    throw new ApiError(400, 'Current password is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password changed successfully');
});

module.exports = { login, getMe, updateProfile, changePassword };
