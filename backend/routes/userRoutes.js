const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  uploadAvatar,
  deleteAccount,
  uploadImages,
  deleteImage,
  getUserImages,
  upload,
  getAllUsers,
  updateUserById,
  deleteUserById,
  getUserStats,
  // NEW: Subscription Management
  getUserSubscriptionStatus, // Get user's current subscription details
  updateUserSubscription,    // Mocked endpoint for upgrade/management
} = require('../controllers/userController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware');

// User's own profile routes (Private)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.post('/upload-avatar', protect, upload.single('avatar'), uploadAvatar);
router.delete('/account', protect, deleteAccount);

// User's general image management routes (Private)
router.post('/upload-images', protect, upload.array('images', 10), uploadImages);
router.delete('/delete-image/:publicId', protect, deleteImage);
router.get('/images', protect, getUserImages);

// NEW: Subscription Management Routes (Private)
router.get('/subscription', protect, getUserSubscriptionStatus);
router.put('/subscription', protect, updateUserSubscription); // For mock upgrades/status changes

// ADMIN ONLY ROUTES (PROTECTED AND AUTHORIZED AS ADMIN)
router.get('/', protect, authorizeAdmin, getAllUsers);
router.put('/:id', protect, authorizeAdmin, updateUserById);
router.delete('/:id', protect, authorizeAdmin, deleteUserById);
router.get('/stats', protect, authorizeAdmin, getUserStats);

module.exports = router;