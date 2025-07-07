const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
  let accessToken;

  // Check for access token in cookies
  if (req.cookies.accessToken) {
    accessToken = req.cookies.accessToken;
  }

  // NEW: Log if access token is present
  console.log(`[AuthMiddleware] Protect: AccessToken present: ${!!accessToken}`);

  if (accessToken) {
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.userId).select('-password');

      if (!req.user) {
        console.warn(`[AuthMiddleware] Protect: User not found for token ID: ${decoded.userId}`); // NEW
        res.status(401);
        throw new Error('Not authorized, user not found after token verification');
      }
      console.log(`[AuthMiddleware] Protect: User authenticated: ${req.user.email}`); // NEW
      next();
    } catch (error) {
      console.error(`[AuthMiddleware] Protect Error: ${error.name} - ${error.message}`); // NEW

      if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
        const refreshToken = req.cookies.refreshToken;
        console.log(`[AuthMiddleware] Protect: RefreshToken present: ${!!refreshToken}`); // NEW

        if (refreshToken) {
          try {
            const decodedRefresh = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            const user = await User.findById(decodedRefresh.userId).select('-password');

            if (!user) {
              console.warn(`[AuthMiddleware] Protect: User not found for refresh token ID: ${decodedRefresh.userId}`); // NEW
              res.status(401);
              throw new Error('Not authorized, user not found from refresh token');
            }

            const generateToken = require('../utils/generateToken');
            generateToken(res, user._id);

            req.user = user;
            console.log(`[AuthMiddleware] Protect: AccessToken refreshed for: ${user.email}`); // NEW
            next();
          } catch (refreshError) {
            console.error(`[AuthMiddleware] Refresh Token Error: ${refreshError.name} - ${refreshError.message}`); // NEW
            res.status(401).json({ message: 'Not authorized, invalid refresh token' });
          }
        } else {
          res.status(401).json({ message: 'Not authorized, no refresh token provided' });
        }
      } else {
        res.status(401).json({ message: 'Not authorized, token failed' });
      }
    }
  } else {
    res.status(401).json({ message: 'Not authorized, no access token' });
  }
});

const authorizeAdmin = (req, res, next) => {
  console.log(`[AuthMiddleware] AuthorizeAdmin: Checking user. isAdmin: ${req.user?.isAdmin}`); // NEW
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    // If not admin, explicitly set 403 and throw error to be caught by error handler
    res.status(403);
    throw new Error('Not authorized as an admin');
  }
};

module.exports = { protect, authorizeAdmin };