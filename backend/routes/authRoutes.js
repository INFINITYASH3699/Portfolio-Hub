const express = require('express');
const router = express.Router();
const {
  registerUser,
  authUser,
  logoutUser,
  refreshAccessToken,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/signup', registerUser);
router.post('/signin', authUser);
router.post('/logout', protect, logoutUser);
router.post('/refresh', refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;