const express = require('express');
const router = express.Router();
const {
  getUserPortfolios,
  createPortfolio,
  getPortfolioById,
  getPublicPortfolioBySlug, // Existing public route for normal users
  updatePortfolio,
  deletePortfolio,
  publishPortfolio,
  getPortfolioAnalytics,
  createPortfolioFromTemplate,
  getMyPortfolios,
  checkTemplateUsage,
  togglePublishPortfolio,
  customizePortfolio,
  duplicatePortfolio,
  getPortfolioStats,
  getAdminPublicPortfolioBySlug, // NEW: Admin-specific public view
} = require('../controllers/portfolioController');

const { uploadSectionImages, updateImageDetails, deletePortfolioImage } = require('../controllers/imageController');
const { protect, authorizeAdmin } = require('../middleware/authMiddleware'); // Ensure authorizeAdmin is imported
const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Public route for viewing published portfolios (for regular users)
router.get('/public/:username/:slug', getPublicPortfolioBySlug);

// NEW ADMIN PUBLIC VIEW ROUTE: Allows admin to view any published portfolio
router.get('/admin/public/:username/:slug', protect, authorizeAdmin, getAdminPublicPortfolioBySlug);

// Private routes (require authentication)
router.get('/my-portfolios', protect, getMyPortfolios);
router.get('/template-usage/:templateId', protect, checkTemplateUsage);
router.post('/create-from-template', protect, createPortfolioFromTemplate);
router.post('/:id/duplicate', protect, duplicatePortfolio);
router.post('/:id/toggle-publish', protect, togglePublishPortfolio);
router.put('/:id/customize', protect, customizePortfolio);

// Image upload/management specific to a portfolio instance
router.post('/:id/upload-section-images', protect, upload.array('images', 10), uploadSectionImages);
router.put('/:id/update-image-details', protect, updateImageDetails);
router.delete('/:id/delete-image/:publicId', protect, deletePortfolioImage);

// ADMIN ROUTE: Get portfolio statistics
router.get('/stats', protect, authorizeAdmin, getPortfolioStats);

// Legacy/General routes (kept for reference, new methods preferred)
router.get('/', protect, getUserPortfolios);
router.post('/', protect, createPortfolio);
router.get('/:id', protect, getPortfolioById); // This is still for user's OWN portfolio edit
router.put('/:id', protect, updatePortfolio);
router.delete('/:id', protect, deletePortfolio);
router.post('/:id/publish', protect, publishPortfolio);
router.get('/:id/analytics', protect, getPortfolioAnalytics);

module.exports = router;