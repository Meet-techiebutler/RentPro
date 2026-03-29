const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) throw new ApiError(401, 'Authentication required. Please log in.');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Invalid or expired token. Please log in again.');
  }

  const user = await User.findById(decoded.id).select('-password');
  if (!user) throw new ApiError(401, 'The user belonging to this token no longer exists.');
  if (!user.isActive) throw new ApiError(403, 'Your account has been deactivated.');
  if (user.changedPasswordAfter(decoded.iat)) {
    throw new ApiError(401, 'Password was recently changed. Please log in again.');
  }

  req.user = user;
  next();
});

const restrictTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action.');
    }
    next();
  });

module.exports = { protect, restrictTo };
